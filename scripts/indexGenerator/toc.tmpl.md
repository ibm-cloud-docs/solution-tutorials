{:navgroup: .navgroup}
{:topicgroup: .topicgroup}

{: .toc subcollection="solution-tutorials" audience="platform" arm="4086992" href="/docs/tutorials?topic=solution-tutorials-tutorials#tutorials" path="tutorials"}
Solution Tutorials

    {: .navgroup id="learn"}
    index.md
{{#each categories}}
{{#unless hidden}}

    {: .topicgroup}
    {{name}}
    {{#each solutions as |solution|}}
    {{#unless hidden}}
        {{#tocLink solution}}{{/tocLink}}
    {{/unless}}
    {{/each}}
{{/unless}}
{{/each}}
    {: .navgroup-end}
    
    {: .navgroup id="howto"}
{{#each tags as |tag|}}
    {: .topicgroup}
    {{tag}}
{{#each ../categories}}{{#unless hidden}}{{#each solutions as |solution|}}{{#unless solution.hidden}}{{#hasTag solution tag}}        {{#tocLink solution}}{{/tocLink}}
{{/hasTag}}{{/unless}}{{/each}}{{/unless}}{{/each}}
{{/each}}
    {: .navgroup-end}
