export interface Serializable<T> {

    serialize(): string;

    deserialize(input: any): T;
}
