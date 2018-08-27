{:navgroup: .navgroup}
{:topicgroup: .topicgroup}

{: .toc subcollection="solution-tutorials" audience="platform" arm="4086992" href="/docs/tutorials/index.html"}
Solution Tutorials

    {: .navgroup id="learn"}
    index.md
{{#each categories}}
{{#unless hidden}}

    {: .topicgroup}
    {{name}}
    {{#each solutions}}
    {{#unless hidden}}
        {{#html2md}}{{url}}{{/html2md}}
    {{/unless}}
    {{/each}}
{{/unless}}
{{/each}}
    {: .navgroup-end}
    
    {: .navgroup id="howto"}
{{#each tags as |tag|}}
    {: .topicgroup}
    {{tag}}
{{#each ../categories}}{{#unless hidden}}{{#each solutions as |solution|}}{{#unless solution.hidden}}{{#hasTag solution tag}}        {{#html2md}}{{solution.url}}{{/html2md}}
{{/hasTag}}{{/unless}}{{/each}}{{/unless}}{{/each}}
{{/each}}
    {: .navgroup-end}
