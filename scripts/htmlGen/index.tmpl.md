---
copyright:
  years: 2017
lastupdated: "2017-12-04"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}

# Solution tutorials
{: #tutorials}

Learn how to build, deploy and scale real-world solutions on IBM Cloud. These guides provide step-by-step instructions on how to implement common patterns based on best practices and proven technologies.

<style>
    .solutionBox {
        margin: 0 10px 20px 0;
        padding: 10px;
        width: 100%;
        border: 1px #dfe3e6 solid;
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
    }
    .solutionBoxContainer {
    }
    .solutionBoxTitle {
      margin: 0rem;
      font-size: 16px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .tag-filter.category {
        background: #aaf9e6;
        color: #238070;
    }
    .tag-filter {
        padding: 3px 12px;
        font-size: 12px;
        margin-right: 1px;
        border-radius: 10px;
        white-space: nowrap;
    }
   .solutionBoxTitle a {
      text-decoration-line:none;
    }
</style>
{{#each categories}}
## {{name}}
{: #{{anchor}} }

<div class = "solutionBoxContainer">
{{#each solutions}}
  <div class = "solutionBox">
    <h3 id="{{url}}" class="solutionBoxTitle">
      <a href = "{{url}}">{{name}}</a>
    </h3>
    <p>{{description}}</p>
    {{#each tags}}
    <span class="tag-filter category">{{this}}</span>
    {{/each}}
  </div>
{{/each}}
</div>

{{/each}}

<div>
<h2 id="aTitle">A title</h2>
<h3 id="a subtitle">A subtitle</h3>
<p>
and content
</p>

<h2 id="anotherTitle">Another title</h2>
<h3 id="another subtitle">Another subtitle</h3>
<p>
and content
</p>
</div>