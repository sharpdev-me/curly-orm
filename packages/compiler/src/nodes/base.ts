export default abstract class ASTNode {
	public abstract name: string;
	public children(): ASTNode[] {
		console.warn(`${this.name}: children() not overridden`);
		return [];
	}
}