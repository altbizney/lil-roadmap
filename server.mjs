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

const app = express();

app.use(express.static('public'));

app.get('/', async (req, res) => {
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

  const { data } = await client.query({
    query: gql`
      query {
        issues {
          nodes {
            title
            state {
              name
            }
            labels {
              nodes {
                id
              }
            }
          }
        }
      }
    `,
  });

  const sortedTasks = data.issues.nodes.sort((a, b) => {
    const order = {
      'In Progress': 0,
      Todo: 1,
      Backlog: 2,
      Canceled: 4,
      Done: 5,
    };
  
    if (a.state.name === b.state.name) {
      // If both tasks have the same status, sort them alphabetically by title
      return a.title.localeCompare(b.title);
    } else {
      // Otherwise, sort by the defined order
      return order[a.state.name] - order[b.state.name];
    }
  });
  
  

  let html = `
    <html>
      <head>
        <link rel="stylesheet" type="text/css" href="/style.css">
      </head>
      <body>
        <img class="tanaki" src="/tanaki.png" alt="Tanaki" />
        <h1>Tanaki Roadmap</h1>
        <table>
          <tr>
            <th>TASK</th>
            <th>STATUS</th>
          </tr>`;

  sortedTasks.forEach((issue) => {
    const hasPublicLabel = issue.labels.nodes.some((label) => label.id === '1c39e675-4833-4418-991b-4db25fc49c83');
    if (hasPublicLabel) {
      const statusClass = `status-${issue.state.name.toLowerCase().replace(' ', '-')}`;
      const isDoneOrCancelled = issue.state.name === 'Done' || issue.state.name === 'Canceled';

      const taskText = isDoneOrCancelled ? `<del>${issue.title}</del>` : issue.title;
      const taskStatus = isDoneOrCancelled ? `<del>${issue.state.name}</del>` : issue.state.name;
      html += `<tr class="${statusClass}"><td>${taskText}</td><td class="${statusClass} status">${taskStatus}</td></tr>`;
    }
  });

  html += `
        </table>
        <p class="linear">Powered by <a href="https://linear.app">Linear</a></p>
      </body>
    </html>`;

  res.send(html);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
