import {Headers, Http, RequestOptions, Response} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Serializable} from './serializable';
import {BaseService} from './base-service';
import {GenericResponse} from './generic-response';

export class RestService<T extends Serializable<T>> extends BaseService {
    protected httpService: Http;
    private headers: Headers = new Headers({'Content-Type': 'application/json'});

    constructor(httpService: Http, private ctor: new() => T) {
        super(httpService);
        this.httpService = httpService;
    }

    public query(parameters: any, path: string = null): Promise<T[]> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        return this.httpService.get(finalPath, this.generateRequestOptions(parameters, new RequestOptions()))
            .toPromise()
            .then((response: Response) => {
                let users: T[] = [];
                if (response.text() === '') {
                    return [];
                }
                response.json().forEach((resource: string) => {
                    let model: T = new this.ctor();
                    model.deserialize(resource);
                    users.push(model);
                });
                return users;
            })
            .catch(this.handleError);
    }

    public getOne(id: number, path: string = null): Promise<T> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        const url = finalPath + (id != null ? '/' + id : '');
        return this.httpService.get(url)
            .toPromise()
            .then((response: Response) => {
                if (response.text() === '' || response.json().length === 0 ||
                    response.json().success === false || response.json().error != null) {
                    return null;
                }
                let model: T = new this.ctor();
                model.deserialize(response.json());
                return model;
            })
            .catch(this.handleError);
    }

    public createOne(model: T, path: string = null): Promise<GenericResponse> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        return this.httpService.post(finalPath, model.serialize(), {headers: this.headers})
            .toPromise()
            .then((response: Response) => new GenericResponse().deserialize(response.json()))
            .catch(this.handleError);
    }

    public updateOne(model: T, path: string = null): Promise<GenericResponse> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        return this.httpService.put(finalPath, model.serialize(), {headers: this.headers})
            .toPromise()
            .then((response: Response) => new GenericResponse().deserialize(response.json()))
            .catch(this.handleError);
    }

    public deleteOne(id: number, path: string = null): Promise<GenericResponse> {
        let finalPath = path != null ? path : this.getBaseUrlPath();
        const url = finalPath + (id != null ? '/' + id : '');
        return this.httpService.delete(url)
            .toPromise()
            .then((response: Response) => new GenericResponse().deserialize(response.json()))
            .catch(this.handleError);
    }

    getBaseUrlPath(): string {
        return '';
    };
}
