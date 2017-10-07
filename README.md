# ng2-restful
> Angular 2+ library for connecting with RESTful API.

## Instalation
Install library into your project using Node package manager (NPM).

``` sh
npm install ng2-restful --save
```

## Usage
This library **does not** contains an Angular2 module with exported components and service, but instead, provides two classes and one interface:
* **RestService\<T extends Serializable\<T>>** - an abstract class which your services need to extend in order to use provided REST methods
* **GenericResponse** - model class returned from custom GET and POST requests performed from RestService
* **Serializable\<T>** - interface which your model classes need to implement in order to be automatically serialized/deserialized when sent/received from REST API

Using this RESTful pattern classes allows you to follow best practices for transferring and mapping entity objects from server to your client application. 
And also, provides a level of consistency to your Angular2 application.

### Creating model
Model classes, which represents resource from your REST API need to implement _Serializable_ interface and it's two methods:
* **serialize(): string** - transforms current state of model object to JSON object
* **deserialize(input: any): T** - transforms response JSON object from API to model object

Exmaple typescript model class (models/article.model.ts):
``` javascript
import {Serializable} from 'ng2-restful';
import {ArticleType} from './article-type.model';

export class Article implements Serializable<Article> {
    id: number;
    name: string;
    content: string;
    articleType: ArticleType;
    createdBy: string;
    created: Date;
    updated: Date;

    serialize(): string {
        return JSON.stringify(this, (key, value) => {
            return value;
        });
    }

    deserialize(input: any): Article {
        this.id = input.id;
        this.name = input.name;
        this.conent = input.content;
        
        // ArticleType is also a model class which implements Serializable<T>
        this.articleType = new ArticleType().deserialize(input.articleType);
        
        this.createdBy = input.createdBy;
        this.created = new Date(input.created);
        this.updated = new Date(input.updated);
        return this;
    }
}
```

### Implementing service
When model class is implemented, then REST service for that particular resource (model) can be created. 
Create new class as service with Angular2 annotation @Injectable() which extends RestService, then create constructor 
and implement abstract method getBaseUrlPath(): string.

Example typescript service class (services/article.service.ts):
``` javascript
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

import {RestService} from 'ng2-restful';
import {GenericResponse} from 'ng2-restful';
import {Article} from '../models/article.model';

@Injectable()
export class ArticleService extends RestService<Article> {

    constructor(private http: Http) {
        super(http, Article);
    }
    
    // This is relative url path on the same host as the angular2 application is served.
    // You can also use full URL path like: http://my.api.com:8080/articles , just make sure
    // that Cross-Origin requests are allowed on that API server.
    getBaseUrlPath(): string {
        return 'api/articles'; 
    }
    
    // Optionally, you can perform non-RESTful request using get() or post() methods
    // Returned value is promise of GenericResponse object which is described below.
    public nonRESTfulRequest(articleId: number): Promise<GenericResponse> {
         return this.get({id: articleId}, this.getBaseUrlPath() + '/check/article');
    }
}
```

When performing updateOne(), deleteOne(), createOn() or non-RESTful requests using get() or post() methods from RestService, then returned value is GenericResponse.
GenericResponse contains three fields:
* **success** - _true_ if request was successful, _false_ otherwise
* **description** - Optional description of requested result
* **data** - map with custom values in format: _key -> value_

It's structure is following:
``` javascript
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
```

### Interacting with API
To use your newly created and implemented service, just inject service into the angular2 @Component's constructor 
and use it as follows:
``` javascript
import {Component, OnInit} from "@angular/core";

import {ArticleService} from "../services/article.service";
import {Article} from "../models/article.model";

@Component({
    moduleId: module.id,
    selector: 'article',
    templateUrl: 'article.component.html'
})
export class ArticleComponent implements OnInit {
    private articles: Article[] = [];
    private article: Article;
    private newArticle: Article = new Article();

    constructor(private articleService: ArticleService) {
    }
    
    ngOnInit(): void {
        // Get all articles with empty parameters list
        this.articleService.query({}).then((articles: Article[]) => {
            this.articles = articles;
        });
        
        // Query articles with URL parameters
        this.articleService.query({typeId: 3, page: 1, limit: 10}).then((articles: Article[]) => {
            this.articles = articles;
        });
        
        // Get one article with provided id
        this.articleService.getOne(5).then((article: Article) => {
            this.article = article;
        });
        
        // Create new article with provided article model object
        this.articleService.createOne(this.newArticle).then((response: GenericResponse) => {
            if (repsonse.success) {
                console.log("Article created! Description: " + response.description);
                console.log("New article id is: " + response.data.get('id');
            } else {
                console.log("Failed creating article");
            }
        });
        
        // Update one article with provided article model object which must have id
        this.articleService.updateOne(this.article).then((response: GenericResponse) => {
            if (repsonse.success) {
                console.log("Article updated! Description: " + response.description);
            } else {
                console.log("Failed updating article");
            }
        });
        
        // Delete one article with provided id
        this.articleService.deleteOne(this.article.id).then((response: GenericResponse) => {
            if (repsonse.success) {
                console.log("Article deleted! Description: " + response.description);
            } else {
                console.log("Failed deleting article");
            }
        });
        
        // Custom service request
        this.articleService.nonRESTfulRequest(this.article.id).then((response: GenericResponse) => {
            if (repsonse.success) {
                console.log("Request successful! Description: " + response.description);
                console.log("Returned someValue: " + response.data.get('someValue')):
            } else {
                console.log("Request failed");
            }
        });
    }
}
```

Complete overview of all available methods provided by RestService:

| Service method  | Arguments                                               | HTTP method  | Return type               |
|:----------------|:--------------------------------------------------------|:-------------|:--------------------------|
| get             | parameters: any, path: string, *options: RequestOptions | GET          | Promise\<GenericResponse> |
| post            | body: any, path: string, *options: RequestOptions       | POST         | Promise\<GenericResponse> |
| query           | parameters: any, *path: string                          | GET          | Promise\<T[]>             |
| getOne          | id: number, *path: string                               | GET          | Promise\<T>               |
| createOne       | model: T, *path: string                                 | POST         | Promise\<GenericResponse> |
| updateOne       | model: T, *path: string                                 | PUT          | Promise\<GenericResponse> |
| deleteOne       | id: number, *path: string                               | DELETE       | Promise\<GenericResponse> |

_Parameters marked with * are optional._

License
- 
MIT