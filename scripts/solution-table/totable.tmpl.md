---
copyright:
  years: 2019
lastupdated: "2019-03-01"

---

# All Solutions
{: solutions}

Use this table in issues when you need to work on a list of files

```
| File | One column | Another column |
| ------- | ----------- | ----------- |
{{#each solutions as |solution|}}
| {{solution.mdUrl}} | |
{{/each}}
```