import WelcomePost, { meta as welcomeMeta } from "./welcome.mdx";
import AvoidGithubSupplyChainAttacksPost, { meta as avoidGithubSupplyChainAttacksMeta } from "./avoid-githu-supply-chain-attacks.mdx";

const posts = [
  { ...welcomeMeta, Component: WelcomePost },
  { ...avoidGithubSupplyChainAttacksMeta, Component: AvoidGithubSupplyChainAttacksPost },
];

export default posts;

