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
