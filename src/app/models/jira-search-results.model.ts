import { Deserializable } from './deserializable.model';

//import { Facility } from '@local/common/models/facility.model';

export class JiraSearchResults implements Deserializable {
    key: string

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    /*export interface JiraSearchResults {
        key: string;
        /*  title: string;
          created: string;
          updated: string;
          issuetype: string;
          project: string;
          team: string;
          estimate: string;
          status: string;
          statusId: string;*/
}
