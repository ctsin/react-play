import { Form, useLoaderData, useActionData, useFetcher, useRevalidator, useNavigate, useSubmit } from "react-router";
import type { ActionFunctionArgs } from "react-router";

export async function loader() {
  console.log("🔄 Loader called at:", new Date().toLocaleTimeString());
  return { 
    timestamp: new Date().toISOString(),
    message: "Data from loader"
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  
  console.log("⚡ Action called with intent:", intent, "at:", new Date().toLocaleTimeString());
  
  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { 
    success: true, 
    intent,
    timestamp: new Date().toISOString()
  };
}

export default function Test() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const submit = useSubmit();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Action & Loader Test Page</h1>
      
      {/* Loader Data Display */}
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h2 className="font-semibold text-blue-800">Loader Data:</h2>
        <p>Message: {loaderData.message}</p>
        <p>Timestamp: {loaderData.timestamp}</p>
      </div>

      {/* Action Data Display */}
      {actionData && (
        <div className="bg-green-50 p-4 rounded mb-6">
          <h2 className="font-semibold text-green-800">Action Data:</h2>
          <p>Success: {actionData.success ? "✅" : "❌"}</p>
          <p>Intent: {actionData.intent}</p>
          <p>Timestamp: {actionData.timestamp}</p>
        </div>
      )}

      {/* Form Methods - Auto trigger loader */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-3">✅ Auto-trigger Loader</h3>
          
          <Form method="post" className="space-y-2">
            <input type="hidden" name="intent" value="form-submit" />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Form Submit
            </button>
          </Form>

          <button 
            onClick={() => {
              const formData = new FormData();
              formData.append("intent", "use-submit");
              submit(formData, { method: "post" });
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded w-full mt-2"
          >
            useSubmit (same route)
          </button>

          <Form method="post" action="/create" className="mt-2">
            <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded w-full">
              Form Submit (different route)
            </button>
          </Form>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-3">❌ No Auto-trigger</h3>
          
          <button 
            onClick={() => {
              fetcher.submit(
                { intent: "fetcher-submit" }, 
                { method: "post" }
              );
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded w-full"
          >
            Fetcher Submit
          </button>

          <fetcher.Form method="post" className="mt-2">
            <input type="hidden" name="intent" value="fetcher-form" />
            <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded w-full">
              Fetcher Form
            </button>
          </fetcher.Form>

          <div className="mt-2 text-sm text-gray-600">
            {fetcher.state === "submitting" && "Submitting..."}
            {fetcher.data && (
              <div className="bg-orange-50 p-2 rounded mt-2">
                Fetcher result: {JSON.stringify(fetcher.data)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Loader Triggers */}
      <div className="mt-6 border p-4 rounded">
        <h3 className="font-semibold mb-3">🔄 Manual Loader Triggers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button 
            onClick={() => revalidator.revalidate()}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            useRevalidator
          </button>
          
          <button 
            onClick={() => revalidator.revalidate()}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            revalidator.revalidate()
          </button>
          
          <button 
            onClick={() => fetcher.load("/test")}
            className="bg-indigo-500 text-white px-4 py-2 rounded"
          >
            fetcher.load() (see fetcher data)
          </button>
        </div>
      </div>

      {/* Fetcher Load Data Display */}
      {fetcher.data && fetcher.state === "idle" && (
        <div className="bg-indigo-50 p-4 rounded mb-6">
          <h2 className="font-semibold text-indigo-800">Fetcher Load Data:</h2>
          <p>Message: {fetcher.data.message}</p>
          <p>Timestamp: {fetcher.data.timestamp}</p>
          <p className="text-sm text-indigo-600 mt-2">⚠️ This is separate from main loader data above</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">📝 Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>• Watch the console for loader/action calls</li>
          <li>• Notice timestamp changes in loader data</li>
          <li>• Form Submit to SAME route: no navigation, reloads loader in-place</li>
          <li>• Form Submit to DIFFERENT route: navigates, adds history entry</li>
          <li>• <strong>Key difference:</strong></li>
          <li>  • Navigation forms (Form, useSubmit) → useActionData() updates</li>
          <li>  • Fetcher forms (fetcher.submit, fetcher.Form) → fetcher.data updates</li>
          <li>• Fetcher to same route still triggers loader (but not useActionData)</li>
          <li>• fetcher.load() gets fresh data but doesn't update main loader</li>
          <li>• Manual triggers (revalidator, navigate) reload main loader data</li>
        </ul>
      </div>
    </div>
  );
}