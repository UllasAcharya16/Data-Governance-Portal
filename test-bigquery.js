import { BigQuery } from "@google-cloud/bigquery";

async function test() {
    const bigquery = new BigQuery();

    const query = `
    SELECT *
    FROM \`governance-demo-498517.gcp_dashboard.sample_sales\`
  `;

    const [rows] = await bigquery.query(query);

    console.log(rows);
}

test().catch(console.error);