import { ExecutableLookupService } from './executable-lookup.service';
import { GitExecutable } from './git-executable';
import { JavaExecutable } from './java-executable';
import { MavenExecutable } from './maven-executable';
import { GitExecutableLookup } from './git-executable-lookup';
import { JavaExecutableLookup } from './java-executable-lookup';
import { MavenExecutableLookup } from './maven-executable-lookup';

export { ExecutableLookupService } from './executable-lookup.service';
export { Executable } from './executable';
export { ExecutableLookup } from './executable-lookup';
export { GitExecutable } from './git-executable';
export { GitExecutableLookup } from './git-executable-lookup';
export { JavaExecutable } from './java-executable';
export { JavaExecutableLookup } from './java-executable-lookup';
export { MavenExecutable } from './maven-executable';
export { MavenExecutableLookup } from './maven-executable-lookup';

export const executableLookupService = new ExecutableLookupService();
executableLookupService.register(GitExecutable.CMD, new GitExecutableLookup());
executableLookupService.register(JavaExecutable.CMD, new JavaExecutableLookup());
executableLookupService.register(MavenExecutable.CMD, new MavenExecutableLookup());
