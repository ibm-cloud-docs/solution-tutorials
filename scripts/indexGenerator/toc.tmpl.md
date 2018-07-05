{:navgroup: .navgroup}
{:topicgroup: .topicgroup}

{: .toc subcollection="solution-tutorials" audience="platform" href="/docs/tutorials/index.html"}
Solution Tutorials

    {: .navgroup id="learn"}
    index.md
    {: .navgroup-end}
    
    {: .navgroup id="howto"}
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
