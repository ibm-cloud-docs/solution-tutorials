---
copyright:
  years: 2017, 2018
lastupdated: "{{date}}"

---

{:shortdesc: .shortdesc}
{:new_window: target="_blank"}

# Solution tutorials
{: #tutorials}

Learn how to build, deploy and scale real-world solutions on IBM Cloud. These guides provide step-by-step instructions on how to use IBM Cloud to implement common patterns based on best practices and proven technologies.
<style>
<!--
    .doesNotExist, #doc-content, #single-content {
        width: calc(100% - 8%) !important;
        max-width: calc(100% - 8%) !important;
    }
    aside.side-nav, #topic-toc-wrapper {
        display: none !important;
    }
    .detailContentArea {
        max-width: 100% !important;
    }
    .solutionBoxContainer {}
    .solutionBoxContainer a {
        text-decoration: none;
        border: none !important;
    }
    .solutionBox {
        display: inline-block;
        width: 100% !important;
        margin: 0 10px 20px 0 !important;
        padding: 10px !important;
        border: 1px #dfe6eb solid !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1) !important;
    }
    @media screen and (min-width: 960px) {
        .solutionBox {
        width: calc(50% - 2%) !important;
        }
        .solutionBox.solutionBoxFeatured {
        width: calc(50% - 2%) !important;
        }
        .solutionBoxContent {
        height: 270px !important;
        }
    }
    @media screen and (min-width: 1298px) {
        .solutionBox {
        width: calc(33% - 2%) !important;
        }
        .solutionBoxContent {
        min-height: 270px !important;
        }
    }
    .solutionBox:hover {
        border-color: #3d70b2 !important;
    }
    .solutionBoxContent {
        display: flex;
        flex-direction: column;
    }
    .solutionBoxTitle {
        margin: 0rem !important;
        font-size: 14px !important;
        font-weight: 700 !important;
        line-height: 16px;
        height: 38px;
        text-overflow: ellipsis;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    .solutionBoxDescription {
        flex-grow: 1;
        display: flex !important;
        flex-direction: column;
    }
    .descriptionContainer {
        flex-grow: 1 !important;
    }
    .descriptionContainer p {
        margin: 0;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        font-size: 12px !important;
        font-weight: 400 !important;
        line-height: 1.5;
        letter-spacing: 0;
        max-height: 70px;
    }
    .architectureDiagramContainer {
        min-width: 250px !important;
        padding: 0 10px !important;
        text-align: center;
    }
    .architectureDiagram {
        max-height: 125px !important;
        padding: 5px !important;
    }
    .tagsContainer {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-top: 10px;
    }
    .tag-filter.category {
        background: #e5ebf5 !important;
        color: #15232c !important;
    }
    .tag-filter {
        padding: 3px 12px !important;
        font-size: 12px !important;
        margin-right: 1px !important;
        border-radius: 10px !important;
        white-space: nowrap !important;
        line-height: 1.8rem !important;
    }
-->
</style>
## Featured Tutorials
<div class = "solutionBoxContainer">
    {{#each featured}}
    {{#unless hidden}}
    <a href = "{{url}}">
    <div class = "solutionBox solutionBoxFeatured">
        <div class = "solutionBoxContent">
        <h3 id="{{url}}" class="solutionBoxTitle">
            {{name}}
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>{{description}}</p>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "{{imgSrc}}" />
            </div>
        </div>
        <div class="tagsContainer">
            {{#each tags}}
                <span class="tag-filter category">{{this}}</span>
            {{/each}}
        </div>
        </div>
    </div>
    </a>
    {{/unless}}
    {{/each}}
</div>

{{#each categories}}
{{#unless hidden}}
## {{name}}
{: #{{anchor}} }

<div class = "solutionBoxContainer">
    {{#each solutions}}
    {{#unless hidden}}
    <a href = "{{url}}">
    <div class = "solutionBox">
        <div class = "solutionBoxContent">
        <h3 id="{{url}}" class="solutionBoxTitle">
            {{name}}
        </h3>
        <div class="solutionBoxDescription">
            <div class="descriptionContainer">
                <p>{{description}}</p>
            </div>
            <div class="architectureDiagramContainer">
                <img class="architectureDiagram" src = "{{imgSrc}}" />
            </div>
        </div>
        <div class="tagsContainer">
            {{#each tags}}
                <span class="tag-filter category">{{this}}</span>
            {{/each}}
        </div>
        </div>
    </div>
    </a>
    {{/unless}}
    {{/each}}
</div>

{{/unless}}
{{/each}}
