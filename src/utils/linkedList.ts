export type LinkedListNode = {
  id: string;
  nextId: string | null;
  prevId: string | null;
  shuffledNextId?: string | null;
  shuffledPrevId?: string | null;
};

export type LinkedList = LinkedListNode[];

export const sortLinkedList = <T>(
  linkedList: T extends LinkedList ? T : never,
  firstItemId: string | null = null,
  useShuffledValue: boolean = false
): T => {
  if (linkedList.length <= 1) {
    return linkedList as T;
  }
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
  while (currentItem && sortedLinkedList.length < linkedList.length) {
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
  return linkedList.length <= 1 || !sortedLinkedList.some((node, index) => {
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

export const checkLinkedListsAreEqual = <T>(
  linkedList1: LinkedList,
  linkedList2: LinkedList,
  isSorted: boolean = false,
  firstItemId: string | null = null,
  useShuffledValue: boolean = false
): boolean => {
  const sortedLinkedList1 = isSorted
    ? linkedList1
    : sortLinkedList(linkedList1, firstItemId, useShuffledValue);
  const sortedLinkedList2 = isSorted
    ? linkedList2
    : sortLinkedList(linkedList2, firstItemId, useShuffledValue);
  return sortedLinkedList1.every(
    (node, index) => node.id === sortedLinkedList2[index].id
  );
};
