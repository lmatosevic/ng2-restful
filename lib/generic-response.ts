import {Serializable} from './serializable';

export class GenericResponse implements Serializable<GenericResponse> {
    success: boolean;
    description: string;
    data: Map<string, string> = new Map();

    serialize(): string {
        return JSON.stringify(this);
    }

    deserialize(input: any): GenericResponse {
        this.success = input.success;
        this.description = input.description;

        for (let key in input.data) {
            if (input.data.hasOwnProperty(key)) {
                this.data.set(key, input.data[key]);
            }
        }

        return this;
    }
}
