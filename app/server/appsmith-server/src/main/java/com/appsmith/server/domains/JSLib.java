package com.appsmith.server.domains;

import com.appsmith.external.models.BaseDomain;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@ToString
@NoArgsConstructor
@Document(collection = "jsLib")
public class JSLib extends BaseDomain {
    /* Application ID of the application where the lib gets installed. */
    String applicationId;

    /* Name of the installed library. */
    String name;

    /* Library version. */
    String version;

    /* A short description of the library. */
    String description;

    /* Src url of the library. */
    String url;

    /* Documentation url for the library. */
    String docsUrl;

    /**
     * - Namespace string for the library. e.g. if the accessor is "#", then the library methods get accessed like
     * #.concat().
     */
    String accessor;

    /* JSON type definition to be used by the Tern server to provide auto-complete feature for the JS library. */
    String jsonTypeDefinition;

    /**
     * -To persist a collection of JS libraries that cannot be supported for various reasons.
     * - By default, we assume all libraries are supported.
     */
    Boolean isSupported = true;
}
