---
copyright:
  years: 2017, 2018
lastupdated: "{{date}}"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}

# Solution tutorials
{: #tutorials}

Learn how to build, deploy and scale real-world solutions on IBM Cloud. These guides provide step-by-step instructions on how to implement common patterns based on best practices and proven technologies.

<style>
    .solutionBox {
        margin: 0 10px 20px 0 !important;
        padding: 10px !important;
        width: 100% !important;
        border: 1px #dfe3e6 solid !important;
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2) !important;
    }
    .solutionBoxContainer {
    }
    .solutionBoxTitle {
      margin: 0rem !important;
      font-size: 16px !important;
      margin-bottom: 10px !important;
      font-weight: 600 !important;
    }
    .tag-filter.category {
        background: #aaf9e6 !important;
        color: #238070 !important;
    }
    .tag-filter {
        padding: 3px 12px !important;
        font-size: 12px !important;
        margin-right: 1px !important;
        border-radius: 10px !important;
        white-space: nowrap !important;
        line-height: 1.8rem !important;
    }
    .solutionBoxDescription {
        display:flex !important;
        flex-wrap: wrap !important;
    }
   .solutionBoxTitle a {
      text-decoration-line:none !important;
    }
    .descriptionContainer {
        flex-grow: 1 !important;
        width: 200px !important;
    }
    .architectureDiagramContainer {
        width: 300px !important;
        padding: 0 10px !important;
    }
    .architectureDiagram {
        max-height: 200px !important;
        padding: 5px !important;
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
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>{{description}}</p>
                {{#each tags}}
                    <span class="tag-filter category">{{this}}</span>
                {{/each}}
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "{{imgSrc}}" />
            </div>
        </div>
    </div>
    {{/each}}
</div>

{{/each}}
