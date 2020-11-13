import React, { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';

interface User {
  id: number;
  name: string;
  shortBio: string;
  isVerified: boolean;
  imageUrl: string;
}

interface UserData {
  Users: User[];
}

interface UserVars {
  name: string;
}

const GET_ROCKET_INVENTORY = gql`
  query GetUsers($offset: Float! = 0, $search: String) {
    Users(take: 20, skip: $offset, search: $search) {
      id
      name
      shortBio
      isVerified
      imageUrl
    }
  }
`;

export function UserList() {
  const { loading, data, fetchMore } = useQuery<UserData, UserVars>(
    GET_ROCKET_INVENTORY,
    {}
  );

  const fetchMoreData = () => {
    if(searchString) return;

    fetchMore({
      variables: {
        offset: data?.Users.length
      },
      updateQuery: (prev: UserData, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          Users: [...prev.Users, ...fetchMoreResult.Users]
        });
      }
    })
  }

  const search = (input: string) => {
    fetchMore({
      variables: {
        search: input && `%${input}%`
      },
      updateQuery: (prev: UserData, { fetchMoreResult }) => {
        return fetchMoreResult || {Users: []};
      }
    })
  }

  
  const handleScroll = () => {
    // http://stackoverflow.com/questions/9439725/javascript-how-to-detect-if-browser-window-is-scrolled-to-bottom
    const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    const scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

    if (scrolledToBottom) {
      fetchMoreData();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  })

  
  const [searchString, setSearchString] = useState("");

  const handleSearchInputChange = (e: any) => {
    setSearchString(e.target.value)
    search(e.target.value)
  }

  return (
    <div>
      <h3>Users</h3>
      <input type="text" onChange={handleSearchInputChange}/>
      {loading ? (
        <p>Loading ...</p>
      ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>ShortBio</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {data && data.Users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.shortBio}</td>
                  {/* <td><img src={user.imageUrl} alt=""/></td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}
