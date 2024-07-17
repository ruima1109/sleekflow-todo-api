// run this script in vscode debugger to simuate streams from DynamoDB for local development and troubleshooting
const dynamoDb = require('../dataUpdateStream');

const insertEvent = {
  Records: [
    {
      eventID: '608d2c77298227005f2b8b1491ee7af5',
      eventName: 'INSERT',
      eventVersion: '1.1',
      eventSource: 'aws:dynamodb',
      awsRegion: 'us-east-1',
      dynamodb: {
        ApproximateCreationDateTime: 1623043410,
        Keys: {
          id: {
            S: '_u30zlc4aa'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        NewImage: {
          createdAt: {
            N: '1623043409275'
          },
          pageTitle: {
            S: 'lodash pick - Google Search'
          },
          imageKey: {
            NULL: true
          },
          channel: {
            S: 'free_text'
          },
          id: {
            S: '_u30zlc4aa'
          },
          position: {
            S: 'zzzzyv'
          },
          state: {
            S: 'todo'
          },
          title: {
            S: 'wewewqr'
          },
          url: {
            S:
              'https://www.google.com/search?q=lodash+pick&oq=lodash+pick&aqs=chrome..69i57j69i59j0l4j69i60l2.5499j0j7&sourceid=chrome&ie=UTF-8'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        SequenceNumber: '800000000032590438775',
        SizeBytes: 340,
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      },
      eventSourceARN:
        'arn:aws:dynamodb:us-east-1:065913925480:table/TodoItem-staging/stream/2021-06-07T03:13:09.443'
    }
  ]
};
const deleteEvent = {
  Records: [
    {
      eventID: 'bd34093918b5e8009bea3d86a72fc225',
      eventName: 'REMOVE',
      eventVersion: '1.1',
      eventSource: 'aws:dynamodb',
      awsRegion: 'us-east-1',
      dynamodb: {
        ApproximateCreationDateTime: 1623043802,
        Keys: {
          id: {
            S: '_fh3j55eqg'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        OldImage: {
          createdAt: {
            N: '1623041237606'
          },
          pageTitle: {
            S:
              'uncaught /node_modules/redux-persist/lib/defaults/asyncLocalStorage.js:1 - Google Search'
          },
          imageKey: {
            NULL: true
          },
          channel: {
            S: 'free_text'
          },
          id: {
            S: '_fh3j55eqg'
          },
          position: {
            S: 'zzzzzf'
          },
          state: {
            S: 'todo'
          },
          title: {
            S: 'efsqwewqeqwe'
          },
          url: {
            S:
              'https://www.google.com/search?q=uncaught+%2Fnode_modules%2Fredux-persist%2Flib%2Fdefaults%2FasyncLocalStorage.js%3A1&oq=uncaught+%2Fnode_modules%2Fredux-persist%2Flib%2Fdefaults%2FasyncLocalStorage.js%3A1&aqs=chrome..69i57.3526j0j7&sourceid=chrome&ie=UTF-8'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        SequenceNumber: '1400000000032590728806',
        SizeBytes: 534,
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      },
      eventSourceARN:
        'arn:aws:dynamodb:us-east-1:065913925480:table/TodoItem-staging/stream/2021-06-07T03:13:09.443'
    }
  ]
};
const updateEvnent = {
  Records: [
    {
      eventID: '04cda4f2e27870a5eea1931d15d50dee',
      eventName: 'MODIFY',
      eventVersion: '1.1',
      eventSource: 'aws:dynamodb',
      awsRegion: 'us-east-1',
      dynamodb: {
        ApproximateCreationDateTime: 1623043563,
        Keys: {
          id: {
            S: '_yqe4itutt'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        NewImage: {
          createdAt: {
            N: '1623037070752'
          },
          pageTitle: {
            S:
              'what is the difference between devdependencies and dependencies in package.json - Google Search'
          },
          imageKey: {
            NULL: true
          },
          channel: {
            S: 'screenshot'
          },
          id: {
            S: '_yqe4itutt'
          },
          position: {
            S: 'zzzzzp'
          },
          state: {
            S: 'todo'
          },
          title: {
            S: 'reret'
          },
          url: {
            S:
              'https://www.google.com/search?q=what+is+the+difference+between+devdependencies+and+dependencies+in+package.json&oq=what%27s+the+difference+between+devD&aqs=chrome.1.69i57j0i22i30l2j0i8i13i30j0i390.10835j0j7&sourceid=chrome&ie=UTF-8'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        OldImage: {
          createdAt: {
            N: '1623037070752'
          },
          pageTitle: {
            S:
              'what is the difference between devdependencies and dependencies in package.json - Google Search'
          },
          imageKey: {
            NULL: true
          },
          channel: {
            S: 'free_text'
          },
          id: {
            S: '_yqe4itutt'
          },
          position: {
            S: 'zzzzzp'
          },
          state: {
            S: 'todo'
          },
          title: {
            S: 'reret'
          },
          url: {
            S:
              'https://www.google.com/search?q=what+is+the+difference+between+devdependencies+and+dependencies+in+package.json&oq=what%27s+the+difference+between+devD&aqs=chrome.1.69i57j0i22i30l2j0i8i13i30j0i390.10835j0j7&sourceid=chrome&ie=UTF-8'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        SequenceNumber: '900000000032590547981',
        SizeBytes: 971,
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      },
      eventSourceARN:
        'arn:aws:dynamodb:us-east-1:065913925480:table/TodoItem-staging/stream/2021-06-07T03:13:09.443'
    }
  ]
};

const objectiveEvent = {
  Records: [
    {
      eventID: 'a075f300248d029127472183424e3c3d',
      eventName: 'MODIFY',
      eventVersion: '1.1',
      eventSource: 'aws:dynamodb',
      awsRegion: 'us-east-1',
      dynamodb: {
        ApproximateCreationDateTime: 1647753705,
        Keys: {
          id: {
            S: 'dwererwer'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        NewImage: {
          createdAt: {
            N: '1627106319094'
          },
          keyResults: {
            L: [
              {
                S: 'kr1'
              },
              {
                S: 'kr2'
              }
            ]
          },
          id: {
            S: 'dwererwer'
          },
          title: {
            S: 'New Objective1'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        OldImage: {
          createdAt: {
            N: '1627106319094'
          },
          keyResults: {
            L: [
              {
                S: 'kr1'
              },
              {
                S: 'kr2'
              }
            ]
          },
          id: {
            S: 'dwererwer'
          },
          title: {
            S: 'New Objective'
          },
          username: {
            S: 'google_110847769933627659803'
          }
        },
        SequenceNumber: '27854400000000026436927830',
        SizeBytes: 254,
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      },
      eventSourceARN:
        'arn:aws:dynamodb:us-east-1:065913925480:table/Objectives/stream/2022-03-14T05:58:09.052'
    }
  ]
};

dynamoDb.handler(objectiveEvent);
