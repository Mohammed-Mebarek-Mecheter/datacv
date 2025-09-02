"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [client] = useState(() => trpcClient);
	const [queryClientState] = useState(() => queryClient);

	return (
		<trpc.Provider client={client} queryClient={queryClientState}>
			<QueryClientProvider client={queryClientState}>
				{children}
			</QueryClientProvider>
		</trpc.Provider>
	);
}
