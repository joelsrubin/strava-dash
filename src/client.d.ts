type TAthlete = {
	id: number;
	username: string;
	resource_state: number;
	firstname: string;
	lastname: string;
	bio: string | null;
	city: string;
	state: string;
	country: string;
	sex: "M" | "F";
	premium: boolean;
	summit: boolean;
	created_at: string;
	updated_at: string;
	badge_type_id: number;
	weight: number;
	profile_medium: string;
	profile: string;
	friend: object | null;
	follower: object | null;
};

type TSplit = {
	distance: number
elapsed_time: number
elevation_difference: number
moving_time: number
split: number
average_speed: number
average_grade_adjusted_speed: number
average_heartrate: number
pace_zone: number
}

type TActivityTotal = {
	count: number;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	elevation_gain: number;
};

type TAthleteStats = {
	biggest_ride_distance: number;
	biggest_climb_elevation_gain: number;
	recent_ride_totals: ActivityTotal;
	recent_run_totals: ActivityTotal;
	recent_swim_totals: ActivityTotal;
	ytd_ride_totals: ActivityTotal;
	ytd_run_totals: ActivityTotal;
	ytd_swim_totals: ActivityTotal;
	all_ride_totals: ActivityTotal;
	all_run_totals: ActivityTotal;
	all_swim_totals: ActivityTotal;
};

type TMetaAthlete = {
	id: number;
};

type TLatLng = [number, number];

type TPolylineMap = {
	id: string;
	polyline?: string;
	summary_polyline: string;
};

type TActivityType =
	| "AlpineSki"
	| "BackcountrySki"
	| "Canoeing"
	| "Crossfit"
	| "EBikeRide"
	| "Elliptical"
	| "Golf"
	| "Handcycle"
	| "Hike"
	| "IceSkate"
	| "InlineSkate"
	| "Kayaking"
	| "Kitesurf"
	| "NordicSki"
	| "Ride"
	| "RockClimbing"
	| "RollerSki"
	| "Rowing"
	| "Run"
	| "Sail"
	| "Skateboard"
	| "Snowboard"
	| "Snowshoe"
	| "Soccer"
	| "StairStepper"
	| "StandUpPaddling"
	| "Surfing"
	| "Swim"
	| "Velomobile"
	| "VirtualRide"
	| "VirtualRun"
	| "Walk"
	| "WeightTraining"
	| "Wheelchair"
	| "Windsurf"
	| "Workout"
	| "Yoga";

type TSportType = TActivityType; // Same values in Strava's API

type TActivity = {
	id: number;
	external_id: string;
	upload_id: number;
	athlete: TMetaAthlete;
	name: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	total_elevation_gain: number;
	elev_high: number;
	elev_low: number;
	/** @deprecated Prefer to use sport_type */
	type: TActivityType;
	sport_type: TSportType;
	start_date: string;
	start_date_local: string;
	timezone: string;
	start_latlng: TLatLng;
	end_latlng: TLatLng;
	achievement_count: number;
	kudos_count: number;
	comment_count: number;
	athlete_count: number;
	photo_count: number;
	total_photo_count: number;
	map: TPolylineMap;
	suffer_score: number;
	average_heartrate: number;
	max_heartrate: number;
	splits_standard: TSplit[];
	device_name: string;
	trainer: boolean;
	commute: boolean;
	manual: boolean;
	private: boolean;
	flagged: boolean;
	workout_type: number;
	upload_id_str: string;
	average_speed: number;
	max_speed: number;
	has_kudoed: boolean;
	hide_from_home: boolean;
	gear_id: string;
	kilojoules: number;
	average_watts: number;
	device_watts: boolean;
	max_watts: number;
	weighted_average_watts: number;
};