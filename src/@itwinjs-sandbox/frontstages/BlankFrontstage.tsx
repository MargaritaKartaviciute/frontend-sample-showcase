/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { ComponentType } from "react";
import { ConfigurableCreateInfo, ContentGroup, ContentLayoutDef, CoreTools, Frontstage, FrontstageProps, FrontstageProvider, useActiveIModelConnection, ViewportContentControl } from "@bentley/ui-framework";
import { IModelConnection } from "@bentley/imodeljs-frontend";

export type IModelConnectionComponent = ComponentType<{ imodel: IModelConnection }>;

const IModelConnectionWrapper: React.FunctionComponent<{ components: IModelConnectionComponent[] }> = ({ components }) => {
  const iModelConnection = useActiveIModelConnection();

  return <>
    {iModelConnection && components.map((Child, index) => <Child key={index} imodel={iModelConnection} />)}
  </>;
};

interface BlankContentOptions {
  components: IModelConnectionComponent[];
}

class BlankContent extends ViewportContentControl {
  constructor(info: ConfigurableCreateInfo, options: BlankContentOptions) {
    super(info, options);

    if (options.components) {
      this.reactNode = (
        <IModelConnectionWrapper components={options.components} />
      );
    }
  }
}

export class BlankFrontstage extends FrontstageProvider {
  // constants
  public static MAIN_CONTENT_ID = "BlankFrontstage";
  public static DEFAULT_NAVIGATION_WIDGET_KEY = "DefaultNavigationWidget";
  public static DEFAULT_MANIPULATION_WIDGET_KEY = "DefaultNavigationWidget";
  // Content layout for content views
  private _contentLayoutDef: ContentLayoutDef;
  // Content group for all layouts
  private _contentGroup: ContentGroup;

  constructor(...components: IModelConnectionComponent[]) {
    super();

    this._contentLayoutDef = new ContentLayoutDef({});

    // Create the content group.
    this._contentGroup = new ContentGroup({
      contents: [
        {
          classId: BlankContent,
          applicationData: {
            components,
          },
        },
      ],
    });
  }

  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps> {
    return (
      <Frontstage
        id={BlankFrontstage.MAIN_CONTENT_ID}
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout={this._contentLayoutDef}
        contentGroup={this._contentGroup}
        isInFooterMode={true}
      />
    );
  }
}
