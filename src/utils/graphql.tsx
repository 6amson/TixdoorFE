import toast from 'react-hot-toast';


export async function graphqlRequest<T = any>(
    query: string,
    variables: Record<string, any> = {},
    token?: string
): Promise<T> {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${backendUrl}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ query, variables }),
        });

        const json = await res.json();

        if (json.errors) {
            const message = json.errors[0]?.message || "GraphQL Error";
            //   toast.error(message);
            //console.log(json.errors);
            throw new Error(message);
        }
        // //console.log("GraphQL response:", json.data);
        return json.data;
    } catch (err: any) {
        toast.error(err.message || "Something went wrong, retry action.");
        throw err;
    }
}


export async function graphqlRequestWithFile<T = any>(
    query: string,
    variables: Record<string, any> = {},
    token?: string
): Promise<T> {
    try {
        const formData = new FormData();

        const operations: {
            query: string;
            variables: Record<string, any>;
        } = {
            query,
            variables: {}
        };

        const map: { [key: string]: string[] } = {};
        let fileCounter = 0;

        Object.keys(variables).forEach(key => {
            if (variables[key] instanceof File) {
                const fileKey = fileCounter.toString();
                map[fileKey] = [`variables.${key}`];
                formData.append(fileKey, variables[key]);
                operations.variables[key] = null;
                fileCounter++;
            } else {
                operations.variables[key] = variables[key];
            }
        });

        formData.append('operations', JSON.stringify(operations));
        formData.append('map', JSON.stringify(map));

        const res = await fetch("http://localhost:3001/graphql", {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        const json = await res.json();

        if (json.errors) {
            const message = json.errors[0]?.message || "GraphQL Error";
            //console.log(json.errors);
            throw new Error(message);
        }

        return json.data;
    } catch (err: any) {
        toast.error(err.message || "Something went wrong, retry action.");
        throw err;
    }
}