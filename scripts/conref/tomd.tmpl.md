

| Keyword | Description | markdown |
| ------- | ----------- | -------- |
{{#each keywords}}
| {{this}} | {{#value this}}{{/value}} | \{{ site.data.keyword.{{this}} }} |
{{/each}} 