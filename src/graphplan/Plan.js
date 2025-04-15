class Plan {
	constructor() {
		this.plan = [];
	}

	append(action) {
		this.plan.push(action);
	}

	remove(action) {
		this.plan.splice(this.plan.indexOf(action), 1);
	}

	equals(other) {
		return (
			this.plan.length === other.plan.length &&
			this.plan.every((action, index) => action === other.plan[index])
		);
	}
}
