import React, { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import './UserList.css';

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

enum VerifiedStatus {
  'ALL' = 0,
  'VERIFIED' = 1,
  'NONVERIFIED' = 2
}

const GET_ROCKET_INVENTORY = gql`
  query GetUsers($offset: Float, $search: String, $verified: Float) {
    Users(take: 10, skip: $offset, search: $search, verified: $verified) {
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

  const [searchString, setSearchString] = useState("");
  const [verified, setVerified] = useState(VerifiedStatus.ALL);

  const fetchData = (reset?: boolean) => {
    fetchMore({
      variables: {
        offset: reset || !data ? 0 : data?.Users.length,
        search: searchString && `%${searchString}%`,
        verified
      },
      updateQuery: (prev: UserData, { fetchMoreResult }) => {
        if(reset) return fetchMoreResult || {Users: []};
        
        if (!fetchMoreResult) return prev;
        
        return Object.assign({}, prev, {
          Users: [...prev.Users, ...fetchMoreResult.Users]
        });
      }
    })
  }
  
  const handleScroll = () => {
    if (Math.ceil(window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
      // todo: make sure it doesn't fire when graphql is retreiving data already
      fetchData();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  })

  useEffect(() => fetchData(true), [verified, searchString])

  const verifiedOptions = [
    {key: VerifiedStatus.ALL, name: 'All'},
    {key: VerifiedStatus.VERIFIED, name: 'Verified only'},
    {key: VerifiedStatus.NONVERIFIED, name: 'Non verified only'},
  ]

  return (
    <div className="tableWrapper">
      <header>
        <h3>Users</h3>
        <input type="text" placeholder='Search ...' onChange={(({target}) => setSearchString(target.value))}/>
        <div className="filterVerified">
          {verifiedOptions.map(op => 
            <a
              key={op.key}
              className={op.key === verified ? 'active' : ''}
              onClick={() => setVerified(op.key)}
            >
              {op.name}
            </a>
          )}
        </div>
      </header>
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
              {data && data.Users.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.shortBio}</td>
                  <td><img src={user.imageUrl} alt={user.name}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}
