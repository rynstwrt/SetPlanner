import {Command} from "commander";


const program = new Command();

program.name("setplanner")
    .description("Generate a rough template of a DJ set track list!")
    .version("0.0.1");

program.command("create")
    .description("")
    .option("--start-with", "Path to a song to start with")
    .action((str, options) => {{
        // const limit = options.first ? 1 : undefined;
        console.log(options);
        console.log(options.start_with);
        // console.log(str.split(options.startwith, limit))
    }});


function main(): void {
    console.log("test");

    program.parse();
}

main();