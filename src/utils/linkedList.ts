type LinkedListNode = {
  id: string;
  nextId: string | null;
  prevId: string | null;
};

type LinkedList = LinkedListNode[];

export const sortLinkedList = <T>(
  linkedList: T extends LinkedList ? T : never,
  firstItemId: string | null = null
): T => {
  const nodeById: { [key: string]: LinkedListNode } = {};
  for (const node of linkedList) {
    nodeById[node.id] = node;
  }
  const firstItem = linkedList.find(
    node => !node.prevId || node.id === firstItemId
  );
  let currentItem = firstItem;
  const sortedLinkedList: LinkedList = [];
  while (currentItem) {
    sortedLinkedList.push(currentItem);
    currentItem = nodeById[currentItem.nextId || ''];
  }
  return sortedLinkedList as T;
};

export const checkLinkedListNodesAreInOrder = <T>(
  linkedList: T extends LinkedList ? T : never,
  isSorted = false,
  firstItemId: string | null = null
): boolean => {
  const sortedLinkedList = isSorted
    ? linkedList
    : sortLinkedList(linkedList, firstItemId);
  return !sortedLinkedList.some((node, index) => {
    if (index === 0) {
      return node.nextId !== sortedLinkedList[index + 1].id;
    }
    if (index === sortedLinkedList.length - 1) {
      return node.prevId !== sortedLinkedList[index - 1].id;
    }
    return (
      node.prevId !== sortedLinkedList[index - 1].id ||
      node.nextId !== sortedLinkedList[index + 1].id
    );
  });
};
