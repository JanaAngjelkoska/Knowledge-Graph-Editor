const base = 'http://localhost:8080';

/**
 * Creates an arbitrary POST request to any backend POST endpoint expecting a single path variable after the suffix.
 * @param pathVariable A path variable containing data (probably ID) for the specified endpoint.
 * @param endpointSuffix The endpoint (suffix) of the API.
 * @param method HTTP Protocol method to use;
 * @returns {Promise<any>} JSON containing requested result.
 */
export async function makePostPathVar(pathVariable, endpointSuffix) {

    const url = `${base}/${endpointSuffix}/${pathVariable}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Could not fulfill request, got: ${response}`);
    }

    return await response.json();
}

/**
 * Creates an arbitrary POST request to any backend endpoint expecting a request body with a JSON.
 * @param postData JSON containing data for the specified endpoint.
 * @param endpointSuffix The endpoint (suffix) of the API.
 * @returns {Promise<any>} JSON containing requested result.
 **/
export async function makePostJsonBody(postData, endpointSuffix) {

    const url = `${base}/${endpointSuffix}`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(
            postData
        )
    });

    console.log(response)

    if (!response.ok) {
        throw new Error(`Could not fulfill request, got: ${response}`)
    }

    return await response.json();
}

/**
 * Creates an arbitrary GET request to any backend endpoint expecting a single path variable.
 * @param pathVariable A path variable containing data (probably ID) for the specified endpoint.
 * @param endpointSuffix The endpoint (suffix) of the API.
 * @returns {Promise<any>} JSON containing requested result.
 **/
export async function makeGetPathVar(pathVariable, endpointSuffix) {

    const url = `${base}/${endpointSuffix}/${pathVariable}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error establishing to: ${url}`);
    }

    return await response.json();
}

/**
 * Creates an arbitrary GET request to any backend endpoint not expecting anything.
 * @param endpointSuffix The endpoint (suffix) of the API.
 * @returns {Promise<any>} JSON containing requested result.
 **/
export async function makeGet(endpointSuffix) {

    const url = `${base}/${endpointSuffix}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error establishing to: ${url}`);
    }

    return await response.json();
}

/**
 * Creates an arbitrary POST request to any backend endpoint with two request parameters in FormData.
 * @param endpointSuffix The endpoint (suffix) of the API.
 * @param param1 The first request parameter.
 * @param param2 The second request parameter.
 * @returns {Promise<any>} JSON containing the requested result.
 **/
export async function makePostFormData(endpointSuffix, param1, param2) {
    const url = `${base}/${endpointSuffix}`;

    const formData = new FormData();
    formData.append('param1', param1);
    formData.append('param2', param2);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Error establishing to: ${url}`);
    }

    return await response.json();
}

export async function makePatchJsonBody(postData, endpointSuffix) {

    const url = `${base}/${endpointSuffix}`

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });

    if (!response.ok) {
        throw new Error(`Could not fulfill request, got: ${response}`);
    }

    return response.json();
}
