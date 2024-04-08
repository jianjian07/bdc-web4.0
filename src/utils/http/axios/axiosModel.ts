import { AxiosRequestConfig } from "axios";
import { RequestOptions } from "/#/axios";

export interface AxiosOptions extends AxiosRequestConfig {
    transform?: AxiosTransform;
    requestOptions?: RequestOptions
}
export abstract class AxiosTransform {

}