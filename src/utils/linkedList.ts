type LinkedListNode = {
  id: string;
  nextId: string | null;
  prevId: string | null;
  shuffledNextId?: string | null;
  shuffledPrevId?: string | null;
};

type LinkedList = LinkedListNode[];

export const sortLinkedList = <T>(
  linkedList: T extends LinkedList ? T : never,
  firstItemId: string | null = null,
  useShuffledValue: boolean = false
): T => {
  const nodeById: { [key: string]: LinkedListNode } = {};
  for (const node of linkedList) {
    nodeById[node.id] = node;
  }
  const prevIdKey = useShuffledValue ? 'shuffledPrevId' : 'prevId';
  const nextIdKey = useShuffledValue ? 'shuffledNextId' : 'nextId';
  const firstItem = linkedList.find(
    node => !node[prevIdKey] || node.id === firstItemId
  );
  let currentItem = firstItem;
  const sortedLinkedList: LinkedList = [];
  while (currentItem) {
    sortedLinkedList.push(currentItem);
    currentItem = nodeById[currentItem[nextIdKey] || ''];
  }
  return sortedLinkedList as T;
};

export const checkLinkedListNodesAreInOrder = <T>(
  linkedList: T extends LinkedList ? T : never,
  isSorted: boolean = false,
  firstItemId: string | null = null,
  useShuffledValue: boolean = false
): boolean => {
  const sortedLinkedList = isSorted
    ? linkedList
    : sortLinkedList(linkedList, firstItemId, useShuffledValue);
  const nextIdKey = useShuffledValue ? 'shuffledNextId' : 'nextId';
  const prevIdKey = useShuffledValue ? 'shuffledPrevId' : 'prevId';
  return !sortedLinkedList.some((node, index) => {
    if (index === 0) {
      return node[nextIdKey] !== sortedLinkedList[index + 1].id;
    }
    if (index === sortedLinkedList.length - 1) {
      return node[prevIdKey] !== sortedLinkedList[index - 1].id;
    }
    return (
      node[prevIdKey] !== sortedLinkedList[index - 1].id ||
      node[nextIdKey] !== sortedLinkedList[index + 1].id
    );
  });
};
