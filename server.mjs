import express from 'express';
import pkgApollo from 'apollo-client';
import pkgInMemoryCache from 'apollo-cache-inmemory';
import pkgHttpLink from 'apollo-link-http';
import fetch from 'node-fetch';
import pkgGql from 'graphql-tag';

const { ApolloClient } = pkgApollo;
const { InMemoryCache } = pkgInMemoryCache;
const { HttpLink } = pkgHttpLink;
const gql = pkgGql;

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.linear.app/graphql',
    headers: {
      Authorization: 'Bearer lin_api_zfePTrUfm8BJoHuVsSg9ZEJlSZXboIErAsKh1wto',
    },
    fetch,
  }),
  cache: new InMemoryCache(),
});

const app = express();

app.get('/', async (req, res) => {
  const { data } = await client.query({
    query: gql`
      query {
        issues {
          nodes {
            title
            description
            state {
              name
            }
          }
        }
      }
    `,
  });

  let html = '<table><tr><th>Title</th><th>Description</th><th>Status</th></tr>';

  data.issues.nodes.forEach(issue => {
    html += `<tr><td>${issue.title}</td><td>${issue.description}</td><td>${issue.state.name}</td></tr>`;
  });

  html += '</table>';

  res.send(html);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
