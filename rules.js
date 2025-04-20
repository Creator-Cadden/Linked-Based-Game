class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("Begin the story");
        this.engine.inventory = [];
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        this.engine.show(locationData.Body);

        // Debugging inventory and choices
        console.log("Current Inventory:", this.engine.inventory); // Debug inventory
        console.log("Choices for this location:", locationData.Choices); // Debug the choices array

        if (locationData.Choices && locationData.Choices.length > 0) {
            for (let choice of locationData.Choices) {
                console.log("Choice:", choice); // Debug individual choice

                // If the choice requires an item, check if the item is in inventory
                if (choice.requiresItem && !this.engine.inventory.includes(choice.requiresItem)) {
                    console.log(`Skipping choice: ${choice.Text} because item ${choice.requiresItem} is missing.`);
                    continue;
                }

                // Add the choice to the scene
                this.engine.addChoice(choice.Text, choice);
            }
        } else {
            this.engine.addChoice("The End.");
        }
    }

    handleChoice(choice) {
        if (!choice) {
            this.engine.gotoScene(End);
            return;
        }

        this.engine.show("&gt; " + choice.Text);

        // Handle unlocking the storage
        if (choice.Action === "unlock_storage") {
            if (this.engine.hasItem("MirrorShard")) {
                this.engine.show("The storage unlocks with a soft click.");
                this.engine.addItem("CHIP A");
                this.engine.gotoScene(Location, "R001_storage");
            } else {
                this.engine.show("You tug at the handle, but it won't budge. You need something thin and sharp to open it.");
                this.engine.addChoice("Return to storage room", { Target: "R001", Text: "Return to storage room" });
                // Ensure the "Return to hallway" choice is added here as well
                this.engine.addChoice("Return to hallway (H001)", { Target: "H001", Text: "Return to hallway" });
            }
            return;
        }

        // Look into mirror
        if (choice.Action === "look_mirror") {
            this.engine.gotoScene(Location, "R002_afterMirror");
            return;
        }

        // Get item (mirror shard)
        if (choice.Action === "get_item") {
            if (choice.givesItem) {
                this.engine.addItem(choice.givesItem);
                console.log("Inventory after getting item:", this.engine.inventory);
                this.engine.show(`You pick up the ${choice.givesItem}. Its edge gleams with possibility.`);
                this.engine.addChoice("Return to hallway (H001)", { Target: "H001", Text: "Return to hallway" });
            }
            this.engine.gotoScene(Location, choice.Target);
            return;
        }

        // Regular navigation
        if (choice.Target) {
            this.engine.gotoScene(Location, choice.Target);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits || "The End.");
    }
}

Engine.load(Start, 'myStory.json');