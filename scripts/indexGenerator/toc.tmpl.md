{:navgroup: .navgroup}
{:topicgroup: .topicgroup}

{: .toc subcollection="solution-tutorials" audience="platform" href="/docs/tutorials/index.html"}
Solution Tutorials

    {: .navgroup id="learn"}
    index.md
    index-redesign.md
{{#each categories}}
{{#unless hidden}}

    {: .topicgroup}
    {{name}}
    {{#each solutions}}
    {{#unless hidden}}
        {{#replace ".html" ".md"}}{{url}}{{/replace}}
    {{/unless}}
    {{/each}}
{{/unless}}
{{/each}}
    {: .navgroup-end}
    
    {: .navgroup id="howto"}
{{#each tags as |tag|}}
    {: .topicgroup}
    {{tag}}
{{#each ../categories}}{{#unless hidden}}{{#each solutions as |solution|}}{{#unless solution.hidden}}{{#hasTag solution tag}}{{#replace ".html" ".md"}}        {{solution.url}}
{{/replace}}{{/hasTag}}{{/unless}}{{/each}}{{/unless}}{{/each}}
{{/each}}
    {: .navgroup-end}
