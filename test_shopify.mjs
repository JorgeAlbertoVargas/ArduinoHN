import dotenv from 'dotenv';
dotenv.config();

const domain = process.env.SHOPIFY_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = '2024-01';
const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

const query = `
  query {
    products(first: 5) {
      edges {
        node {
          title
          priceRange {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  }
`;

async function testShopify() {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error fetching:", err);
  }
}

testShopify();
