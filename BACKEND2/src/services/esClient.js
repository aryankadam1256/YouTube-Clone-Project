import { Client } from "@elastic/elasticsearch";

let esClient = null;

export const getEsClient = () => {
  if (esClient) return esClient;

  const node = process.env.ELASTICSEARCH_URL;
  if (!node) {
    return null;
  }

  esClient = new Client({
    node,
    auth: process.env.ELASTICSEARCH_USERNAME
      ? {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD ?? "",
        }
      : undefined,
    tls: process.env.ELASTICSEARCH_TLS_SKIP_VERIFY === "true"
      ? { rejectUnauthorized: false }
      : undefined,
  });

  return esClient;
};

export const isElasticsearchEnabled = () => {
  return Boolean(getEsClient());
};

