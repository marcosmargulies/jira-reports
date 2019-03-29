import { Deserializable } from './deserializable.model';

export class JiraSearchResults implements Deserializable {
    key: string;

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

}
