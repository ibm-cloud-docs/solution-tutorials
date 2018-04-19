---
copyright:
  years: 2018
lastupdated: "2018-04-18"

---

# Conref Table
{: conref}

Copy/paste from this table

| Keyword | Description | markdown |
| ------- | ----------- | -------- |
{{#each keywords}}
| {{this}} | {{#value this}}{{/value}} | \{{ site.data.keyword.{{this}} }} |
{{/each}}
