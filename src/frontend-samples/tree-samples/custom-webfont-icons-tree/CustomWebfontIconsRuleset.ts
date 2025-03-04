import { ChildNodeSpecificationTypes, RelationshipDirection, Ruleset, RuleTypes } from "@bentley/presentation-common";

const ruleset: Ruleset = {
  id: "TreeWithIcons",
  supportedSchemas: {
    schemaNames: [
      "BisCore",
    ],
  },
  rules: [
    {
      ruleType: RuleTypes.RootNodes, // "RootNodes"
      specifications: [
        {
          specType: ChildNodeSpecificationTypes.InstanceNodesOfSpecificClasses, // "InstanceNodesOfSpecificClasses"
          classes: [
            {
              schemaName: "BisCore",
              classNames: [
                "GeometricModel3d",
              ],
            },
          ],
          arePolymorphic: true,
          groupByClass: false,
          groupByLabel: false,
        },
      ],
    },
    {
      ruleType: RuleTypes.ChildNodes, // "ChildNodes"
      condition: "ParentNode.IsOfClass(\"GeometricModel3d\", \"BisCore\")",
      specifications: [
        {
          specType: ChildNodeSpecificationTypes.RelatedInstanceNodes, // "RelatedInstanceNodes"
          relationshipPaths: [
            {
              relationship: {
                schemaName: "BisCore",
                className: "ElementOwnsChildElements",
              },
              direction: RelationshipDirection.Forward, // "Forward"
              targetClass: {
                schemaName: "BisCore",
                className: "GeometricElement3d",
              },
            },
          ],
          groupByClass: false,
          groupByLabel: false,
        },
      ],
    },
    {
      ruleType: RuleTypes.ChildNodes, // "ChildNodes"
      condition: "ParentNode.IsOfClass(\"GeometricElement3d\", \"BisCore\")",
      specifications: [
        {
          specType: ChildNodeSpecificationTypes.RelatedInstanceNodes, // "RelatedInstanceNodes"
          relationshipPaths: [
            {
              relationship: {
                schemaName: "BisCore",
                className: "ElementOwnsChildElements",
              },
              direction: RelationshipDirection.Forward, // "Forward"
              targetClass: {
                schemaName: "BisCore",
                className: "GeometricElement3d",
              },
            },
          ],
          groupByClass: false,
          groupByLabel: false,
        },
      ],
    },
    {
      ruleType: RuleTypes.ImageIdOverride, // "ImageIdOverride"
      condition: "ThisNode.IsOfClass(\"GeometricModel3d\", \"BisCore\")",
      imageIdExpression: "\"fas:fa-stream\"",
    },
    {
      ruleType: RuleTypes.ImageIdOverride, // "ImageIdOverride"
      condition: "ThisNode.IsOfClass(\"GeometricElement3d\", \"BisCore\")",
      imageIdExpression: "\"fas:fa-box\"",
    },
  ],
};

export default ruleset;
