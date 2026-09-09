import { getProductsFromOdoo } from './odooApi';

export async function syncOdooCatalog() {
  console.log('[Odoo-Shopify Sync] Iniciando sincronización...');
  
  const domain = process.env.SHOPIFY_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!domain || !token) {
    console.error('[Odoo-Shopify Sync] Faltan credenciales de Shopify');
    return;
  }

  try {
    // 1. Obtener todos los productos de Odoo
    const odooProducts = await getProductsFromOdoo(200);
    if (!odooProducts || !odooProducts.length) {
      console.log('[Odoo-Shopify Sync] No hay productos en Odoo.');
      return;
    }

    // 2. Filtrar solo los que deben ser publicados en la web
    const publishedProducts = odooProducts.filter((item: any) => {
      if (item.product_properties && Array.isArray(item.product_properties)) {
        const mostrarEnWebProp = item.product_properties.find(
          (prop: any) => prop.string === 'Mostrar en Web'
        );
        if (mostrarEnWebProp) {
          return mostrarEnWebProp.value === true;
        }
      }
      if (!item.description) return false;
      const notes = item.description.toLowerCase();
      if (notes.includes('no publicar')) return false;
      if (notes.includes('publicar')) return true;
      return false;
    });

    console.log(`[Odoo-Shopify Sync] Encontrados ${publishedProducts.length} productos publicados.`);

    // 3. Sincronizarlos con Shopify
    for (const item of publishedProducts) {
      // Usar default_code (SKU) o generar uno
      const sku = item.default_code || `ODOO-${item.id}`;
      const title = item.name || 'Sin nombre';
      const price = item.list_price || 0;
      const stock = item.qty_available || 0;
      const description = item.description_sale || item.description || '';
      
      // Construir imagen si existe
      let imageUrl = null;
      if (item.image_512 && typeof item.image_512 === 'string') {
        imageUrl = `data:image/jpeg;base64,${item.image_512}`; // Formato Base64 para adjuntar, pero Shopify API prefiere attachments
        // Para simplificar, si hay imagen, podríamos subirla. Pero requiere un attachment base64 sin el prefijo
      }

      // Buscar si el producto existe por SKU
      const searchRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
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
          variables: { query: `sku:${sku}` }
        })
      });
      
      const searchData = await searchRes.json();
      const existingProduct = searchData?.data?.products?.edges?.[0]?.node;

      if (existingProduct) {
        // ACTUALIZAR (Por simplicidad, solo actualizamos precio de la variante principal)
        const variantId = existingProduct.variants.edges[0].node.id;
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
                  productVariant { id }
                }
              }
            `,
            variables: {
              input: {
                id: variantId,
                price: price.toString()
              }
            }
          })
        });
        console.log(`[Odoo-Shopify Sync] Actualizado: ${title} (${sku})`);
      } else {
        // CREAR PRODUCTO
        const createRes = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
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
                        node { id }
                      }
                    }
                  }
                  userErrors { field message }
                }
              }
            `,
            variables: {
              input: {
                title: title,
                descriptionHtml: `<p>${description}</p>`,
                vendor: 'Odoo',
                productType: 'Hardware',
                status: 'ACTIVE',
                seo: {
                  title: title,
                  description: 'Sincronizado desde Odoo'
                }
              }
            }
          })
        });

        const createData = await createRes.json();
        
        if (createData?.errors) {
          console.error(`[Odoo-Shopify Sync] Error GraphQL al crear ${title}:`, JSON.stringify(createData.errors));
          continue;
        }

        if (createData?.data?.productCreate?.userErrors?.length > 0) {
          console.error(`[Odoo-Shopify Sync] Error creando ${title}:`, createData.data.productCreate.userErrors);
          continue;
        }

        const newVariantId = createData?.data?.productCreate?.product?.variants?.edges[0]?.node?.id;
        const newProductId = createData?.data?.productCreate?.product?.id;

        if (newVariantId) {
          // Asignar precio y SKU a la nueva variante
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
                    productVariant { id }
                  }
                }
              `,
              variables: {
                input: {
                  id: newVariantId,
                  price: price.toString(),
                  sku: sku,
                  inventoryManagement: 'SHOPIFY'
                }
              }
            })
          });

          // Asegurar que esté publicado en los canales online
          if (newProductId) {
             const numericProductId = newProductId.split('/').pop();
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

            // Subir la imagen base64 de Odoo mediante la API REST de Shopify
            if (item.image_512 && typeof item.image_512 === 'string') {
              try {
                await fetch(`https://${domain}/admin/api/2024-01/products/${numericProductId}/images.json`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': token,
                  },
                  body: JSON.stringify({
                    image: {
                      attachment: item.image_512
                    }
                  })
                });
                console.log(`[Odoo-Shopify Sync] Imagen adjuntada para: ${title}`);
              } catch (imgErr) {
                console.error(`[Odoo-Shopify Sync] Error adjuntando imagen para ${title}:`, imgErr);
              }
            }
          }
          console.log(`[Odoo-Shopify Sync] Creado: ${title} (${sku})`);
        }
      }
    }
    
    console.log('[Odoo-Shopify Sync] Sincronización finalizada.');
  } catch (err) {
    console.error('[Odoo-Shopify Sync] Error fatal:', err);
  }
}
