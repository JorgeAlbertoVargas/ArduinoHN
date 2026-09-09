export async function syncDigikeyProductToShopify(partData: any, priceHNL: number) {
  const domain = process.env.SHOPIFY_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!domain || !token) {
    throw new Error('Shopify Admin credentials are not configured');
  }

  const sku = `DK-${partData.digiKeyPartNumber || partData.manufacturerPartNumber}`;
  
  // 1. Check if product already exists by SKU using GraphQL
  const searchConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({
      query: `
        query productBySku($query: String!) {
          products(first: 1, query: $query) {
            edges {
              node {
                id
                variants(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        query: `sku:${sku}`
      }
    })
  };

  try {
    const searchRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, searchConfig);
    const searchData = await searchRes.json();
    
    if (searchData?.data?.products?.edges?.length > 0) {
      // Product exists, return variant ID
      const productNode = searchData.data.products.edges[0].node;
      const variantId = productNode.variants.edges[0].node.id;
      
      // Asegurar que esté publicado (por si acaso se creó antes del fix)
      try {
        const numericProductId = productNode.id.split('/').pop();
        await fetch(`https://${domain}/admin/api/2024-01/products/${numericProductId}.json`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token,
          },
          body: JSON.stringify({
            product: {
              id: numericProductId,
              published: true,
              published_scope: "global"
            }
          })
        });
      } catch (e) {
        console.error('Error al actualizar publicación del producto existente', e);
      }

      // Sincronizar hacia Odoo asíncronamente (actualización)
      syncProductToOdoo({
        title: `[ArduinoHN Global] ${partData.manufacturerPartNumber} - ${partData.title}`,
        sku: sku,
        price: Number(priceHNL),
        description: partData.description
      }).catch(err => console.error('[Odoo Sync] Error updating existing product:', err));

      return variantId;
    }
    
    // 2. Product doesn't exist, create it
    const formattedPrice = Number(priceHNL).toFixed(2);
    
    const createConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query: `
          mutation productCreate($input: ProductInput!) {
            productCreate(input: $input) {
              product {
                id
                variants(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            title: `[ArduinoHN Global] ${partData.manufacturerPartNumber} - ${partData.title}`,
            descriptionHtml: `<p>${partData.description}</p><p>Fabricante: ${partData.manufacturer}</p>`,
            vendor: 'DigiKey',
            productType: 'Componente Electrónico',
            status: 'ACTIVE',
            tags: 'digikey, hidden_from_storefront',
            seo: {
              title: partData.manufacturerPartNumber,
              description: 'Componente importado'
            }
          }
        }
      })
    };

    const createRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, createConfig);
    const createData = await createRes.json();

    if (createData?.errors) {
      console.error('Error GraphQL de Shopify:', JSON.stringify(createData.errors));
      throw new Error('Error al ejecutar la mutación GraphQL: ' + JSON.stringify(createData.errors));
    }

    if (createData?.data?.productCreate?.userErrors?.length > 0) {
      console.error('Error creando producto en Shopify:', createData.data.productCreate.userErrors);
      throw new Error('No se pudo crear el producto en Shopify');
    }

    const newVariantId = createData?.data?.productCreate?.product?.variants?.edges[0]?.node?.id;
    
    if (newVariantId) {
      // 3. Update the default variant with price, SKU, etc.
      await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: `
            mutation productVariantUpdate($input: ProductVariantInput!) {
              productVariantUpdate(input: $input) {
                productVariant {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            input: {
              id: newVariantId,
              price: formattedPrice,
              sku: sku,
              inventoryManagement: 'SHOPIFY',
              inventoryPolicy: 'CONTINUE',
              requiresShipping: true
            }
          }
        })
      });
      // Opcional: Para ocultar completamente del storefront de Shopify (temas Liquid), 
      // establecemos metafield seo.hidden = 1
      await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: `
            mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
              metafieldsSet(metafields: $metafields) {
                metafields {
                  id
                }
              }
            }
          `,
          variables: {
            metafields: [
              {
                ownerId: createData.data.productCreate.product.id,
                namespace: "seo",
                key: "hidden",
                type: "integer",
                value: "1"
              }
            ]
          }
        })
      });

      // 5. Publicar el producto en el canal Online Store para que pueda ser agregado al carrito de Storefront API
      const numericProductId = createData.data.productCreate.product.id.split('/').pop();
      await fetch(`https://${domain}/admin/api/2024-01/products/${numericProductId}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          product: {
            id: numericProductId,
            published: true,
            published_scope: "global"
          }
        })
      });

      // Sincronizar hacia Odoo asíncronamente
      syncProductToOdoo({
        title: `[ArduinoHN Global] ${partData.manufacturerPartNumber} - ${partData.title}`,
        sku: sku,
        price: Number(priceHNL),
        description: partData.description
      }).catch(err => console.error('[Odoo Sync] Error creating product:', err));

      return newVariantId;
    }

    throw new Error('Error al extraer el Variant ID después de crear: ' + JSON.stringify(createData));
    
  } catch (error) {
    console.error('Shopify Sync Error:', error);
    throw error;
  }
}

