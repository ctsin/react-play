import { useState, useCallback } from "react";
import type { ActionFunctionArgs } from "react-router";
import { Form, redirect, Link } from "react-router";
import prisma from "~/lib/prisma";
import _ from "lodash";

import { DICTIONARY } from "~/constants";
import type { Word } from "~/interface";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const word = formData.get("newItem") as string;
    const dictionaryData = formData.get("dictionaryData") as string;

    if (word && dictionaryData) {
      const parsedData = JSON.parse(dictionaryData);

      await prisma.vocabulary.create({
        data: {
          word: parsedData.word,
          phonetic: parsedData.phonetic,
          definition: parsedData.meanings[0]?.definitions[0]?.definition,
        },
      });
    }

    console.log("Item created successfully:", word);
    return redirect("/");
  } catch (error) {
    console.error("Action error:", error);
    return { error: (error as any).message };
  }
}

export default function Create() {
  const [inputValue, setInputValue] = useState("");
  const [dictionaryData, setDictionaryData] = useState<Word | null>(null);

  const debouncedFetch = useCallback(
    _.debounce(async (word: string) => {
      try {
        const response = await fetch(`${DICTIONARY}/${word}`);
        const data: Word[] = await response.json();
        setDictionaryData(data[0]);
      } catch (error) {
        console.error("Error fetching dictionary data:", error);
      }
    }, 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const word = e.target.value;
    setInputValue(word);

    if (word) {
      debouncedFetch(word);
    } else {
      setDictionaryData(null);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
        >
          <span>← Home</span>
        </Link>
      </div>
      <Form method="post" className="flex flex-col gap-4">
        <input
          value={inputValue}
          type="text"
          name="newItem"
          placeholder="Create a new item"
          className="flex-auto p-2 border rounded border-gray-300"
          onChange={handleInputChange}
        />
        {dictionaryData && (
          <>
            <input
              type="hidden"
              name="dictionaryData"
              value={JSON.stringify(dictionaryData)}
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <strong className="text-4xl">{dictionaryData.word}</strong>
                {dictionaryData.phonetic}
              </div>
              {dictionaryData.meanings[0]?.definitions[0]?.definition}
            </div>
          </>
        )}
        <button
          className="p-2 bg-blue-500 text-white rounded flex-auto"
          type="submit"
          disabled={!dictionaryData}
        >
          Create
        </button>
      </Form>
    </div>
  );
}
