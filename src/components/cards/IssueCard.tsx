import type { IssueItem } from "@/types";
import { ISSUE_STATUS } from "@/constants";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import { SvgIcon } from "../ui/SvgIcon";
import { UserLink } from "../ui/UserLink";
import { LabelList } from "./LabelList";
import { CardStat } from "./CardParts";
import styles from "./IssueCard.module.css";

interface IssueCardProps {
  item: IssueItem;
}

export const IssueCard = ({ item }: IssueCardProps) => {
  const issueStatus = ISSUE_STATUS[item.state];

  return (
    <Card repo={item.repo} age={item.age} className={styles[item.state]}>
      <CardTitle href={item.url} icon={issueStatus.icon} iconTooltip={item.state.toUpperCase()}>
        #{item.number} {item.title}
      </CardTitle>
      <LabelList labels={item.labels} repo={item.repo} />
      <CardFooter>
        <span className={styles.assignee}>
          {item.assignee ? (
            <>
              <SvgIcon name="arrowRight" />
              <UserLink username={item.assignee} />
            </>
          ) : (
            "unassigned"
          )}
        </span>
        <CardStat icon="comment" count={item.comments} tooltip={`${item.comments} comments`} />
      </CardFooter>
    </Card>
  );
};
