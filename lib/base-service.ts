import {Http, RequestOptions, Response, URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {GenericResponse} from './generic-response';

export class BaseService {
    protected httpService: Http;

    constructor(httpService: Http) {
        this.httpService = httpService;
    }

    public get(parameters: any, path: string, options: RequestOptions = new RequestOptions()): Promise<GenericResponse> {
        return this.httpService.get(path, this.generateRequestOptions(parameters, options))
            .toPromise()
            .then((response: Response) => new GenericResponse().deserialize(response.json()))
            .catch(this.handleError);
    }

    public post(body: any, path: string, options: RequestOptions = new RequestOptions()): Promise<GenericResponse> {
        return this.httpService.post(path, body, options)
            .toPromise()
            .then((response: Response) => new GenericResponse().deserialize(response.json()))
            .catch(this.handleError);
    }

    public generateRequestOptions(parameters: any, requestOptions: RequestOptions): RequestOptions {
        if (!parameters) {
            return requestOptions;
        }

        let params = new URLSearchParams();
        Object.keys(parameters).forEach(key => {
            params.set(key, parameters[key]);
        });
        requestOptions.params = params;
        return requestOptions;
    }

    public handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }
}
