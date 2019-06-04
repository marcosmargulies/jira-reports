export class StatusStory {
    fromDateTime: Date;
    toDateTime: Date;
    transitionDurationHours: number;
    transitionDurationDays: number;
    from: string;
    to: string;
}

export class JiraDataItem {
    label: string;
    type: string;
    data: number[];
}
