export type RepairSegment = {
  kind: 'syntax' | 'content' | 'encoded';
  raw: string;
  text?: string;
  autolink?: boolean;
};

export type RepairCase = {
  id: string;
  category: string;
  source: string;
  segments: RepairSegment[];
  suite?: string;
  scope?: string;
  kind?: string;
};

export type BodyUnit = {
  id: string;
  char: string;
  deliveredAt: number;
  autolink: boolean;
};

export type DeliveredContent = {
  units: BodyUnit[];
  text: string;
};

export type SemanticUnit = {
  char: string;
  role: string;
};

export type SemanticElement = {
  tag: string;
  children?: SemanticNode[];
  href?: string;
  src?: string;
  alt?: string;
  type?: string | null;
  checked?: boolean;
  start?: number;
  text?: string;
};

export type SemanticNode = string | SemanticElement;

export type SemanticSnapshot = {
  units: SemanticUnit[];
  text: string;
  tree: SemanticNode[];
};

export type SnapshotOptions = {
  computedVisibility?: boolean;
};

export type Alignment = {
  matches: [number, number][];
  extra: number[];
};

export type AlignedCharacter = {
  char: string;
};

export type SyntaxUnit = {
  id: string;
  char: string;
  start: number;
  end: number;
};

export type VisibleSyntaxUnit = SyntaxUnit & {
  role: string;
};

export type TrajectoryFrame = {
  offset: number;
  done: boolean;
  expected: DeliveredContent;
  snapshot: SemanticSnapshot;
};

export type RepairOracle = {
  roles: Record<string, string>;
  tree: SemanticNode[];
  text?: string;
};

export type JumpEvent = {
  type: string;
  before: string;
  after: string;
  expected: string;
  ids: string[];
  text: string;
  frameIndex: number;
  offset: number;
  done: boolean;
  affected: number;
};

export type TrajectorySummary = {
  hadJump: boolean;
  events: number;
  bodyEvents: number;
  syntaxEvents: number;
  syntaxChanges: number;
  transitionFrames: number;
  firstWrongChars: number;
  missingArea: number;
  deliveredArea: number;
  inputChars: number;
  completionEvents: number;
  finalTextCorrect: boolean;
  finalStructureCorrect?: boolean;
};

export type TrajectoryResult = {
  events: JumpEvent[];
  summary: TrajectorySummary;
};

export type CanonicalNode = {
  text?: string;
  marks?: SemanticElement[];
  tag?: string;
  children?: CanonicalNode[];
};

export function semanticSnapshot(container: Element, options?: SnapshotOptions): SemanticSnapshot;
export function align(expected: AlignedCharacter[], actual: AlignedCharacter[]): Alignment;
export function syntaxUnits(test: RepairCase, offset: number): SyntaxUnit[];
export function visibleSyntax(
  test: RepairCase,
  frame: TrajectoryFrame,
  alignment: Alignment,
): Map<string, VisibleSyntaxUnit>;
export function scoreTrajectory(
  test: RepairCase,
  frames: TrajectoryFrame[],
  oracle?: RepairOracle,
): TrajectoryResult;
export function canonicalTree(nodes: SemanticNode[], marks?: SemanticElement[]): CanonicalNode[];
export function equivalentTree(left: SemanticNode[], right: SemanticNode[]): boolean;

export function inputOffsets(source: string): number[];
export function delivered(test: RepairCase, offset: number): DeliveredContent;
