/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";
import walkthrough from "!walkthrough-loader!./walkthru.md";

export function getIssuesSpec(): SampleSpec {
  return ({
    name: "issue-sample",
    label: "Issues",
    image: "issues-thumbnail.png",
    description: "",
    walkthrough,
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "IssuesApi.tsx", import: import("!editor-file-loader!./IssuesApi") },
      { name: "IssuesApp.tsx", import: import("!editor-file-loader!./IssuesApp"), entry: true },
      { name: "IssuesWidget.tsx", import: import("!editor-file-loader!./IssuesWidget") },
      { name: "IssuesClient.ts", import: import("!editor-file-loader!./IssuesClient") },
      { name: "Issues.scss", import: import("!editor-file-loader!./Issues.scss") },
    ],
    iModelList: [SampleIModels.MetroStation],
    type: "IssuesApp.tsx",
  });
}
