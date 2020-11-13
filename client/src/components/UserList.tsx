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
  query GetUsers($offset: Float! = 0, $search: String, $verified: Boolean) {
    Users(take: 20, skip: $offset, search: $search, verified: $verified) {
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
    if(searchString || verified !== null) return;

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

  const search = () => {
    console.log(verified)
    fetchMore({
      variables: {
        search: searchString && `%${searchString}%`,
        verified
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
  const [verified, setVerified] = useState(null as boolean | null);

  const handleSearchInputChange = (e: any) => {
    setSearchString(e.target.value)
  }

  const handleVerifiedChange = (verified: 'ALL'|'VERIFIED'|'NON-VERIFIED') => {
    switch(verified) {
      case 'VERIFIED':
        setVerified(true)
        break;
      case 'NON-VERIFIED':
        setVerified(false)
        break;
      default: 
        setVerified(null);
        break;
    }
  }

  useEffect(search, [verified, searchString])


  return (
    <div>
      <h3>Users</h3>
      <input type="text" onChange={handleSearchInputChange}/>
      <div>
        <a onClick={() => handleVerifiedChange('ALL')}>All</a>
        <a onClick={() => handleVerifiedChange('VERIFIED')}>Verified only</a>
        <a onClick={() => handleVerifiedChange('NON-VERIFIED')}>Non verified only</a>

      </div>
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
