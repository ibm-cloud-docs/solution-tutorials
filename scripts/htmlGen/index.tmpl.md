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
<div>
{{#each categories}}
  <h2 id="{{anchor}}">{{name}}</h2>
{: #{{anchor}} }
    <div class = "solutionBoxContainer">
    {{#each solutions}}
      <div class = "solutionBox">
          <div class="solutionBoxTitle">
            <a href = "{{url}}">{{name}}</a>
          </div>
          <p>{{description}}</p>
          {{#each tags}}
          <span class="tag-filter category">{{this}}</span>
          {{/each}}
      </div>
    {{/each}}
    </div>
{{/each}}
</div>
