# Design Element Classification

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [Design Element Classification APIs](https://developer.bentley.com/apis/designelementclassification/operations/) to retrieve iModel classification results and show misclassified iModels elements in a viewer app.

## Purpose

+ Highlight misclassified elements in iModel.
+ Populate table of misclassified elements.
+ Visualize misclassified elements by emphasizing them and coloring by misclassified label color.
+ Zoom to misclassified element on table or misclassified element label selection.
+ Provide code examples for calling the Design Element Classification APIs.

## Description

Design Element Classification is a feature in iTwin Platform that allows to find misclassified geometric elements in iModels, the Design Element Classification ML model can help to identify problematic elements and even make suggestions as to what the proper classifications should have been. An API now provides direct access to this functionality to enable 3rd-party app integration.

The goal of this sample is demonstrate misclassification results, which are returned by calling [Get Design Element Classification result API](https://developer.bentley.com/apis/designelementclassification/operations/mcl-run-result-get/).   In order to get misclassification results firstly iModel classification should be created ([Design Element Classification](https://developer.bentley.com/apis/designelementclassification/operations/mcl-run-create/)).

