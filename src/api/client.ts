const BASE_URL = "https://www.strava.com/api/v3";

export const fetchAthelete = async ({ token }: { token: string }) => {
	const response = await fetch(`${BASE_URL}/athlete`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.json() as Promise<TAthlete>;
};

export const fetchAtheleteStats = async ({
	token,
	athleteId,
}: {
	token: string;
	athleteId: number;
}) => {
	const response = await fetch(`${BASE_URL}/athletes/${athleteId}/stats`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return response.json() as Promise<any>;
};
