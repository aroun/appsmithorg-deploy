import Api from "api/Api";
import { ApiResponse } from "./ApiResponses";
import { AxiosPromise } from "axios";
import { AppColorCode } from "constants/DefaultTheme";
import { AppIconName } from "components/ads/AppIcon";
import { AppLayoutConfig } from "reducers/entityReducers/pageListReducer";

export interface PublishApplicationRequest {
  applicationId: string;
}

export interface ChangeAppViewAccessRequest {
  applicationId: string;
  publicAccess: boolean;
}

export interface PublishApplicationResponse extends ApiResponse {
  data: unknown;
}

export interface ApplicationPagePayload {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface ApplicationResponsePayload {
  id: string;
  name: string;
  organizationId: string;
  pages?: ApplicationPagePayload[];
  appIsExample: boolean;
  appLayout?: AppLayoutConfig;
  unreadCommentThreads?: number;
}

export interface FetchApplicationResponse extends ApiResponse {
  data: ApplicationResponsePayload & { pages: ApplicationPagePayload[] };
}

export interface FetchApplicationsResponse extends ApiResponse {
  data: Array<ApplicationResponsePayload & { pages: ApplicationPagePayload[] }>;
}

export interface CreateApplicationResponse extends ApiResponse {
  data: ApplicationResponsePayload;
}

export interface CreateApplicationRequest {
  name: string;
  orgId: string;
  color?: AppColorCode;
  icon?: AppIconName;
}

export interface SetDefaultPageRequest {
  id: string;
  applicationId: string;
}

export interface DeleteApplicationRequest {
  applicationId: string;
}

export interface DuplicateApplicationRequest {
  applicationId: string;
}

export interface ForkApplicationRequest {
  applicationId: string;
  organizationId: string;
}

export interface GetAllApplicationResponse extends ApiResponse {
  data: Array<ApplicationResponsePayload & { pages: ApplicationPagePayload[] }>;
}

export type UpdateApplicationPayload = {
  icon?: string;
  color?: string;
  name?: string;
  currentApp?: boolean;
  appLayout?: AppLayoutConfig;
};

export type UpdateApplicationRequest = UpdateApplicationPayload & {
  id: string;
};

export interface ApplicationObject {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  organizationId: string;
  pages: ApplicationPagePayload[];
  userPermissions: string[];
}

export interface UserRoles {
  name: string;
  roleName: string;
  username: string;
}

export interface OrganizationApplicationObject {
  applications: Array<ApplicationObject>;
  organization: {
    id: string;
    name: string;
  };
  userRoles: Array<UserRoles>;
}
export interface FetchUsersApplicationsOrgsResponse extends ApiResponse {
  data: {
    organizationApplications: Array<OrganizationApplicationObject>;
    user: string;
    newReleasesCount: string;
    releaseItems: Array<Record<string, any>>;
  };
}

export interface ImportApplicationRequest {
  orgId: string;
  applicationFile?: File;
  progress?: (progressEvent: ProgressEvent) => void;
  onSuccessCallback?: () => void;
}

class ApplicationApi extends Api {
  static baseURL = "v1/applications/";
  static publishURLPath = (applicationId: string) => `publish/${applicationId}`;
  static createApplicationPath = (orgId: string) => `?orgId=${orgId}`;
  static changeAppViewAccessPath = (applicationId: string) =>
    `${applicationId}/changeAccess`;
  static setDefaultPagePath = (request: SetDefaultPageRequest) =>
    `${ApplicationApi.baseURL}${request.applicationId}/page/${request.id}/makeDefault`;
  static publishApplication(
    publishApplicationRequest: PublishApplicationRequest,
  ): AxiosPromise<PublishApplicationResponse> {
    return Api.post(
      ApplicationApi.baseURL +
        ApplicationApi.publishURLPath(publishApplicationRequest.applicationId),
      undefined,
      {},
    );
  }
  static fetchApplications(): AxiosPromise<FetchApplicationsResponse> {
    return Api.get(ApplicationApi.baseURL);
  }

  static getAllApplication(): AxiosPromise<GetAllApplicationResponse> {
    return Api.get(ApplicationApi.baseURL + "new");
  }

  static fetchApplication(
    applicationId: string,
  ): AxiosPromise<FetchApplicationResponse> {
    return Api.get(ApplicationApi.baseURL + applicationId);
  }

  static fetchAppLibraries(): Promise<ApiResponse> {
    const libs = [
      {
        name: "dayjs",
        latest:
          "https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.10.6/dayjs.min.js",
        filename: "dayjs.min.js",
        description: "A JavaScript visualization library for HTML and SVG.",
        version: "7.0.1",
        jsonTypeDefinition: {
          "!name": "dayjs",
          "!define": {
            "dayjs.prototype.parse.!0": {
              date: {
                "!type": "number",
                "!span": "1667[0:1667]-1671[0:1671]",
              },
              args: "dayjs.!1.args",
            },
            "dayjs.prototype.$utils.!ret": {
              s: {
                "!type": "fn(t: number, e: number, n: string) -> !0",
                "!span": "851[0:851]-852[0:852]",
              },
              z: {
                "!type": "fn(t: dayjs.!ret) -> string",
                "!span": "855[0:855]-856[0:856]",
              },
              m: {
                "!type": "fn(e: dayjs.!ret, n: dayjs.!ret) -> number",
                "!span": "978[0:978]-979[0:979]",
              },
              a: {
                "!type": "fn(t: number) -> number",
                "!span": "1177[0:1177]-1178[0:1178]",
              },
              p: {
                "!type": "fn(t: string) -> string",
                "!span": "1233[0:1233]-1234[0:1234]",
              },
              u: {
                "!type": "fn(t: bool|number) -> bool",
                "!span": "1346[0:1346]-1347[0:1347]",
              },
              w: {
                "!type": "fn(t: number, e: dayjs.!ret) -> dayjs.!ret",
                "!span": "1719[0:1719]-1720[0:1720]",
              },
              "!span": "850[0:850]-1379[0:1379]",
              l: "dayjs.locale",
              i: "dayjs.isDayjs",
            },
            "dayjs.prototype.$locale.!ret": {
              name: {
                "!type": "string",
                "!span": "560[0:560]-564[0:564]",
              },
              months: "dayjs.en.weekdays",
              weekdays: "dayjs.en.weekdays",
            },
            "dayjs.prototype.locale.!ret": {},
            "dayjs.!1": {
              date: {
                "!type": "number",
                "!span": "1667[0:1667]-1671[0:1671]",
              },
              args: {
                "!type": "[dayjs.!1|number]",
                "!span": "1676[0:1676]-1680[0:1680]",
              },
              "!span": "1746[0:1746]-1793[0:1793]",
            },
            "dayjs.!ret": {
              "!proto": "dayjs.prototype",
              $d: {
                "!type": "+Date",
                "!span": "1919[0:1919]-1921[0:1921]",
              },
              $y: {
                "!type": "number",
                "!span": "2372[0:2372]-2374[0:2374]",
              },
              $M: {
                "!type": "number",
                "!span": "2396[0:2396]-2398[0:2398]",
              },
              $D: {
                "!type": "number",
                "!span": "2417[0:2417]-2419[0:2419]",
              },
              $W: {
                "!type": "number",
                "!span": "2437[0:2437]-2439[0:2439]",
              },
              $H: {
                "!type": "number",
                "!span": "2456[0:2456]-2458[0:2458]",
              },
              $m: {
                "!type": "number",
                "!span": "2477[0:2477]-2479[0:2479]",
              },
              $s: {
                "!type": "number",
                "!span": "2500[0:2500]-2502[0:2502]",
              },
              $ms: {
                "!type": "number",
                "!span": "2523[0:2523]-2526[0:2526]",
              },
              $x: "?",
            },
          },
          dayjs: {
            prototype: {
              parse: {
                "!type": "fn(t: ?|dayjs.!1)",
                "!span": "1896[0:1896]-1901[0:1901]",
              },
              init: {
                "!type": "fn()",
                "!span": "2337[0:2337]-2341[0:2341]",
              },
              $utils: {
                "!type": "fn() -> dayjs.prototype.$utils.!ret",
                "!span": "2550[0:2550]-2556[0:2556]",
              },
              isValid: {
                "!type": "fn() -> bool",
                "!span": "2580[0:2580]-2587[0:2587]",
              },
              isSame: {
                "!type": "fn(t: ?, e: ?) -> bool",
                "!span": "2634[0:2634]-2640[0:2640]",
              },
              isAfter: {
                "!type": "fn(t: ?, e: ?) -> bool",
                "!span": "2713[0:2713]-2720[0:2720]",
              },
              isBefore: {
                "!type": "fn(t: ?, e: ?) -> bool",
                "!span": "2766[0:2766]-2774[0:2774]",
              },
              $g: {
                "!type": "fn(t: ?, e: string, n: string) -> !this.<i>",
                "!span": "2818[0:2818]-2820[0:2820]",
              },
              unix: {
                "!type": "fn() -> number",
                "!span": "2876[0:2876]-2880[0:2880]",
              },
              valueOf: {
                "!type": "fn() -> number",
                "!span": "2933[0:2933]-2940[0:2940]",
              },
              startOf: {
                "!type": "fn(t: string, e: bool) -> dayjs.!ret",
                "!span": "2980[0:2980]-2987[0:2987]",
              },
              endOf: {
                "!type": "fn(t: string) -> dayjs.!ret",
                "!span": "3615[0:3615]-3620[0:3620]",
              },
              $set: {
                "!type": "fn(t: string, e: number) -> !this",
                "!span": "3662[0:3662]-3666[0:3666]",
              },
              set: {
                "!type": "fn(t: string, e: number) -> dayjs.!ret",
                "!span": "4067[0:4067]-4070[0:4070]",
              },
              get: {
                "!type": "fn(t: ?) -> fn(e: ?) -> dayjs.prototype.<i>",
                "!span": "4118[0:4118]-4121[0:4121]",
              },
              add: {
                "!type": "fn(r: number, h: string) -> dayjs.!ret",
                "!span": "4159[0:4159]-4162[0:4162]",
              },
              subtract: {
                "!type": "fn(t: ?, e: ?) -> dayjs.!ret",
                "!span": "4494[0:4494]-4502[0:4502]",
              },
              format: {
                "!type": "fn(t: ?) -> string",
                "!span": "4544[0:4544]-4550[0:4550]",
              },
              utcOffset: {
                "!type": "fn() -> number",
                "!span": "5396[0:5396]-5405[0:5405]",
              },
              diff: {
                "!type": "fn(r: ?, d: ?, $: ?) -> number",
                "!span": "5474[0:5474]-5478[0:5478]",
              },
              daysInMonth: {
                "!type": "fn() -> number",
                "!span": "5703[0:5703]-5714[0:5714]",
              },
              $locale: {
                "!type": "fn() -> dayjs.en",
                "!span": "5753[0:5753]-5760[0:5760]",
              },
              locale: {
                "!type": "fn(t: ?, e: ?) -> dayjs.prototype.locale.!ret",
                "!span": "5793[0:5793]-5799[0:5799]",
              },
              clone: {
                "!type": "fn() -> dayjs.!ret",
                "!span": "5890[0:5890]-5895[0:5895]",
              },
              toDate: {
                "!type": "fn() -> +Date",
                "!span": "5935[0:5935]-5941[0:5941]",
              },
              toJSON: {
                "!type": "fn() -> string",
                "!span": "5988[0:5988]-5994[0:5994]",
              },
              toISOString: {
                "!type": "fn() -> string",
                "!span": "6055[0:6055]-6066[0:6066]",
              },
              toString: {
                "!type": "fn() -> string",
                "!span": "6110[0:6110]-6118[0:6118]",
              },
              "<i>": {
                "!type": "fn(e: ?) -> dayjs.prototype.<i>",
                "!span": "6298[0:6298]-6302[0:6302]",
              },
              "!span": "6188[0:6188]-6197[0:6197]",
            },
            extend: {
              "!type":
                "fn(t: ?, e: ?) -> fn(t: number, e: dayjs.!1) -> dayjs.!ret",
              "!span": "6350[0:6350]-6356[0:6356]",
            },
            locale: {
              "!type": "fn(t: ?, e: ?, n: bool) -> !0",
              "!span": "6408[0:6408]-6414[0:6414]",
            },
            isDayjs: {
              "!type": "fn(t: number) -> bool",
              "!span": "6419[0:6419]-6426[0:6426]",
            },
            unix: {
              "!type": "fn(t: ?) -> dayjs.!ret",
              "!span": "6431[0:6431]-6435[0:6435]",
            },
            en: {
              name: {
                "!type": "string",
                "!span": "560[0:560]-564[0:564]",
              },
              weekdays: {
                "!type": "[string]",
                "!span": "570[0:570]-578[0:578]",
              },
              "!span": "6467[0:6467]-6469[0:6469]",
              months: "dayjs.en.weekdays",
            },
            Ls: {
              "!span": "6477[0:6477]-6479[0:6479]",
              "<i>": "dayjs.en",
            },
            "!type": "fn(t: number, e: dayjs.!1) -> dayjs.!ret",
            "!span": "189[0:189]-194[0:194]",
          },
        },
      },
      {
        name: "axios",
        latest:
          "https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js",
        filename: "axios.min.js",
        description: "Promise based HTTP client for the browser and node.js",
        version: "0.21.1",
      },
    ];
    return Promise.resolve({
      responseMeta: {
        status: 200,
        success: true,
      },
      data: libs,
    });
    // return Api.get(ApplicationApi.baseURL + applicationId + "/libraries");
  }

  static fetchApplicationForViewMode(
    applicationId: string,
  ): AxiosPromise<FetchApplicationResponse> {
    return Api.get(ApplicationApi.baseURL + `view/${applicationId}`);
  }

  static createApplication(
    request: CreateApplicationRequest,
  ): AxiosPromise<PublishApplicationResponse> {
    return Api.post(
      ApplicationApi.baseURL +
        ApplicationApi.createApplicationPath(request.orgId),
      { name: request.name, color: request.color, icon: request.icon },
    );
  }

  static setDefaultApplicationPage(
    request: SetDefaultPageRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.put(ApplicationApi.setDefaultPagePath(request));
  }

  static changeAppViewAccess(
    request: ChangeAppViewAccessRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.put(
      ApplicationApi.baseURL +
        ApplicationApi.changeAppViewAccessPath(request.applicationId),
      { publicAccess: request.publicAccess },
    );
  }

  static updateApplication(
    request: UpdateApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    const { id, ...rest } = request;
    return Api.put(ApplicationApi.baseURL + id, rest);
  }

  static deleteApplication(
    request: DeleteApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.delete(ApplicationApi.baseURL + request.applicationId);
  }

  static duplicateApplication(
    request: DuplicateApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.post(ApplicationApi.baseURL + "clone/" + request.applicationId);
  }

  static forkApplication(
    request: ForkApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.post(
      "v1/applications/" +
        request.applicationId +
        "/fork/" +
        request.organizationId,
    );
  }

  static importApplicationToOrg(
    request: ImportApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    const formData = new FormData();
    if (request.applicationFile) {
      formData.append("file", request.applicationFile);
    }
    return Api.post("v1/applications/import/" + request.orgId, formData, null, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: request.progress,
    });
  }
}

export default ApplicationApi;
